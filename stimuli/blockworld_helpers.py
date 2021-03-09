import numpy as np
from PIL import Image

from matplotlib import pylab, mlab, pyplot
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from matplotlib.path import Path
import matplotlib.patches as patches
from skimage import measure
import copy
import json
import datetime
import random
from random import randint
import string
import os

######################### SOME DRAWING FUNCTIONS ##########################
###########################################################################    

def patch_for_block(b):
    return get_patch(b.verts,color=b.base_block.color)

def patches_for_world(blocks):
    patches = []
    for (b) in blocks:
        patches.append(patch_for_block(b))
    return patches

def draw_world(world):
    render_blockworld(patches_for_world(world.blocks)) 
    

def get_patch(verts,
              color='orange',
              line_width = 2):
    '''
    input:
        verts: array or list of (x,y) vertices of convex polygon. 
                last vertex = first vertex, so len(verts) is num_vertices + 1
        color: facecolor
        line_width: edge width    
    output:
        patch matplotlib.path patch object
    '''
    codes = [1] + [2]*(len(verts)-1)    ## 1 = MOVETO, 2 = LINETO
    path = Path(verts,codes)
    patch = patches.PathPatch(path, facecolor=color, lw=line_width)
    return patch

def render_blockworld(patches,
                      xlim=(-2,10),
                      ylim=(-2,10),
                      figsize=(4,4)):
    
    '''
    input: 
        patches: list of patches generated by get_patch() function
        xlim, ylim: axis limits
        figsize: defaults to square aspect ratio
    output:
        visualization of block placement
    '''
    fig = plt.figure(figsize=figsize)
    ax = fig.add_subplot(111)
    for patch in patches:
        ax.add_patch(patch)
    ax.set_xlim(xlim)
    ax.set_ylim(ylim) 
    cur_axes = plt.gca()
    cur_axes.axes.get_xaxis().set_visible(False)
    cur_axes.axes.get_yaxis().set_visible(False)        
    plt.show()
    return fig


######################### SOME I/O HELPER FUNCTIONS #######################
########################################################################### 

def jenga_blocks(w,n):

    for j in range(0,n):
        i = 0;
        block_removed = False
        while not block_removed:
            #block_number = random_block_order.pop
            (block_removed, w2) = w.jenga_block(i)
            if block_removed:
                w = w2
            else:
                i += 1;
    return w

def generate_random_world(remove_num_blocks=5, 
                          block_dims = [
                            (1,2),
                            (2,1),
                            (2,2),
                            (2,4),
                            (4,2)
                            ]):    
    _w = World(block_dims = block_dims)
    _w.fill_world()
    block_dict = _w.get_block_dict() 

    ## build world from JSON
    w = World()
    w.populate_from_block_dict(block_dict)

    ## remove some blocks to sparsify world
    w2 = jenga_blocks(w,remove_num_blocks)
    block_dict = w2.get_block_dict()

    return w2, block_dict

def save_world_json(block_dict, 
                    path_to_dump = './sampled_worlds_json',
                    worldId = 123456789):
    '''
    write JSON representation of block world to file
    '''
    ## compute simple attributes to append to filename: total_area, num_blocks, timestamp
    total_area = 0
    for block in block_dict['blocks']:
        total_area += (block['height'] * block['width'])
    num_blocks = len(block_dict['blocks'])    
    ## now write to file
    if not os.path.exists(path_to_dump):
        os.makedirs(path_to_dump)
    with open(os.path.join(path_to_dump,'blockworld_area{}_num{}_time{}.js'.format(total_area,num_blocks,worldId)), 'w') as fout:
         json.dump(block_dict, fout)  
    return block_dict
    
def save_world_render(block_dict,
                     path_to_dump = './sampled_worlds_render',
                     worldId = 123456789):
    '''
    write image rendering of block world to file
    '''
    ## build world from JSON
    w = World()
    w.populate_from_block_dict(block_dict)
    ## compute simple attributes to append to filename: total_area, num_blocks, timestamp
    total_area = 0
    for block in block_dict['blocks']:
        total_area += (block['height'] * block['width'])
    num_blocks = len(block_dict['blocks'])     
    
    ## now write to file    
    if not os.path.exists(path_to_dump):
        os.makedirs(path_to_dump)    
    fig = draw_world(w)
    fig.savefig(os.path.join(path_to_dump,'blockworld_area{}_num{}_time{}.png'.format(total_area,num_blocks,worldId)))
    plt.close(fig)
    return fig
    
def generate_worldId():
    from random import randint
    return str(randint(1e9, 1e10-1))

def save_world(block_dict, path_to_dump = './sampled_worlds'):
    worldId = generate_worldId()
    block_dict = save_world_json(block_dict, worldId = worldId, path_to_dump = path_to_dump + "_json")
    fig = save_world_render(block_dict, worldId = worldId, path_to_dump = path_to_dump +"_render")

######################### DEFINITION OF BLOCK CLASS ################################
############### other blocks can inherit from the base block class #################

class BaseBlock:
    '''
    Base Block class for defining a block object with attributes
    '''
    
    def __init__(self, width=1, height=1, shape='rectangle', color='gray'):
        self.base_verts = np.array([(0, 0), 
                               (0, 1 * height), 
                               (1 * width, 1 * height), 
                               (1 * width, 0), 
                               (0,0)])
        self.width = width
        self.height = height
        self.shape = shape
        self.color = color
    
    def __str__(self):
        return(str(self.width) + 'x' + str(self.height))

    def init(self):
        self.corners = self.get_corners(self.base_verts)
        self.area = self.get_area(shape=self.shape) 
        
    def translate(self, base_verts, dx, dy):
        '''
        input:
            base_verts: array or list of (x,y) vertices of convex polygon. 
                    last vertex = first vertex, so len(base_verts) is num_vertices + 1
            dx, dy: distance to translate in each direction
        output:
            new vertices
        '''
        new_verts = copy.deepcopy(base_verts)
        new_verts[:,0] = base_verts[:,0] + dx
        new_verts[:,1] = base_verts[:,1] + dy
        return new_verts

    def get_corners(self,base_verts):
        '''
        input: list or array of block vertices in absolute coordinates
        output: absolute coordinates of top_left, bottom_left, bottom_right, top_right
        '''
        corners = {}
        corners['bottom_left'] = verts[0]
        corners['top_left'] = verts[1]
        corners['top_right'] = verts[2]
        corners['bottom_right'] = verts[3]
        return corners

    def get_area(self,shape='rectangle'):
        '''
        input: w = width 
               h = height           
               shape = ['rectangle', 'square', 'triangle']
        output
        '''
        ## extract width and height from dims dictionary 
        if shape in ['rectangle','square']:
            area = self.width*self.height
        elif shape=='triangle':
            area = self.width*self.height*0.5
        else:
            print('Shape type not recognized. Please use recognized shape type.')
        return area   



#################### DEFINITION OF BLOCK CLASS ###################################
############### this subclasses BaseBlock above ##################################

class Block:
    '''
        Creates Block objects that are instantiated in a world
        x and y define the position of the BOTTOM LEFT corner of the block
        
        Defines functions to calculate relational properties between blocks
    '''
    def __init__(self, base_block, x, y):
        self.base_block = base_block # defines height, width and other functions
        #bottom left coordinate
        self.x = x
        self.y = y
        self.height = base_block.height
        self.width = base_block.width
        self.verts = base_block.translate(base_block.base_verts,x,y)
    
    #Block Relational Properties
    def above(self, other):
        ''' Test whether this block is fully above another block.
        
            Returns true iff the height of the bottom face of this block 
            is greater than or equal to the top face of other block.
        '''
        return (self.y >= other.y + other.height)
    
    def below(self, other):
        ''' Test whether this block is fully below another block.
            
            Returns true iff the height of the top face of this block 
            is less than or equal to the bottom face of other block.
        '''
        return (self.y + self.height <= other.y)
    
    def leftof(self, other):
        ''' Test whether this block is fully to the left of another block
        
            Returns true iff the height of the bottom face of this block 
            is greater than or equal to the top face of other block.
        '''
        return (self.x + self.width <= other.x)
    
    def rightof(self, other):
        ''' Test whether this block is fully to the right of another block.
            
            Returns true iff the height of the top face of this block 
            is less than or equal to the bottom face of other block.
        '''
        return (self.x >= other.x + other.width)
    
    def sides_touch(self, other):
        ''' Test to see whether this block sits touching sides of another block.
            Corner to corner treated as not touching.
        '''
        y_overlap = not self.above(other) and not self.below(other) 
        buttressing_side = self.x == other.x + other.width or other.x == self.x + self.width
        return y_overlap and buttressing_side
    
    def vertical_touch(self, other):
        ''' Test to see whether this block sits top to bottom against other block.
            Corner to corner treated as not touching.
        '''
        x_overlap = not self.leftof(other) and not self.rightof(other) 
        buttressing_up = self.y == other.y + other.height or other.y == self.y + self.height
        return x_overlap and buttressing_up
    
    def touching(self, other):
        ''' Test to see if this block is touching another block.
            Corner to corner treated as not touching.
        '''
        return self.sides_touch(other) or self.vertical_touch(other)        

    def abs_overlap(self, other, horizontal_overlap=True):
        ''' horizontal- are we measuring horizontal overlap?
        '''
        if horizontal_overlap and self.vertical_touch(other):
            return min([abs(self.x + self.width - other.x), abs(other.x + other.width - self.x)])
        elif not horizontal_overlap and self.sides_touch(other):
            return min([abs(self.y + self.height - other.y), abs(other.y + other.height - self.y)])
        else:
            return 0
        
    def partially_supported_by(self, other):
        ''' True if the base of this block is touching the top of the other block 
        '''
        return self.above(other) and (self.abs_overlap(other) > 0)
    
    def completely_supported_by(self, other):
        ''' True if the whole of the base of this block is touching the top of the other block 
        '''
        return self.above(other) and (self.abs_overlap(other) == self.width)
    
    def dual_supported(self, block_a, block_b):
        ''' Is this block partially supported by both blocks a and b?
        '''
        return self.partially_supported(block_a) and self.partially_supported(block_b)
    
    
    '''
    Other useful properties:
    - 
    
    '''





######################### DEFINITION OF BLOCK WORLD CLASS ##########################
############### This class samples a block world. ##################################
    
# World Class
class World:       
    '''
    This class samples a block world. 
    
    Dependencies: 
        Block class. 
    
    Input: block and world attributes
        block_dims: tuples defining width and height of types of allowable blocks
        block_colors: colors that will be mapped to these blocks
        world_width: width of world, this must be positive natural number
        world_height: height of world, this must be positive natural number        
    
    Output: filled block world
        blocks: list of blocks with attributes
        
    x and y are attributes of a block that refer to the location of its bottom left corner within the World object
        
    '''
    
    
    def __init__(self, 
                block_dims = [(1,1), # Blocks from left to right, thinest to thickest, shortest to tallest        
                            (1,2),
                            (2,1),
                            (2,2),
                            (2,4),
                            (4,2),
                            (4,4),
                            (8,2)
                            ],
                block_colors = ['#D33E43',
                            '#29335C',
                            '#C4C4C4',
                            '#0F8B8D',
                            '#2E3B44',
                            '#E79598',
                            '#8A8FA6',
                            '#91CACB',
                            '#B3B7BB',
                            '#D33E43',
                            '#EAEAEA'],
                world_width = 8, 
                world_height = 8):
                                
        
        # block parameters
        self.block_dims = block_dims
        self.block_colors = block_colors               
        self.base_blocks = [BaseBlock(w,h,color=c) for ((w,h),c) in list(zip(block_dims,block_colors[0:len(block_dims)]))] # Block types should be in order from left to right, thinest to thickest, shortest to tallest
        self.block_widths = list(map(lambda b: b.width, self.base_blocks))  
        self.base_block_dict = dict(zip(block_dims, self.base_blocks))
        
        # world parameters
        self.world_width = world_width 
        self.world_height = world_height 
        self.block_map = np.zeros((self.world_width, self.world_height), dtype=int) ## bitmap for placement of blocks        
        self.blocks = []   
        self.full = False
        
    def check_full(self):
        '''
        Checks to see whether the World contains any empty space by summing block_map
        '''
        if not self.full:
            self.full = (sum(sum(self.block_map)) == self.world_width*self.world_height)
            return self.full
        else:
            return True
        
    def fill_floor(self, floor_space):
        '''
        Fills a 'floor', a level horizontal surface, with blocks.
        Input: Lexicon of blocks- np arrays with 5 coordinates; length of available floor space
        Output: List of blocks that can be used to fill the floor space with no gaps
        '''
        
        floor_blocks = []
        floor_block_widths = []
        viable_block_widths = copy.deepcopy(self.block_widths)
        remaining_space = floor_space
        while remaining_space > 0:
            i = np.random.randint(0,len(viable_block_widths))
            if self.block_widths[i] <= remaining_space:
                floor_blocks.append([self.base_blocks[i],floor_space-remaining_space])
                floor_block_widths.append(self.block_widths[i])
                remaining_space -= self.block_widths[i]
            else:
                viable_block_widths.pop()
        return(floor_blocks)

    def fill_floor_here(self, current_level, left_lim, right_lim):
        '''
        Fills a 'floor', a level horizontal surface, with blocks.
        Input: current_level: current height of floor we are trying to fill
               left_lim, right_lim: horizontal limits of current floor space to fill 
                                   (length of available floor space)
        
        '''
        
        floor_space = right_lim - left_lim
        floor_blocks = []
        floor_block_x_location = left_lim
        
        viable_block_widths = copy.deepcopy(self.block_widths)
        viable_blocks = copy.deepcopy(self.base_blocks)
        
        remaining_height = self.world_height - current_level
        remaining_space = floor_space

        changed = False

        while remaining_space > 0 and len(viable_blocks) > 0:
            i = np.random.randint(0,len(viable_blocks))
            base_block = self.base_blocks[i]
            if base_block.width <= remaining_space and base_block.height <= remaining_height: 
                b = Block(self.base_blocks[i],floor_block_x_location,current_level)
                floor_block_x_location += b.width
                floor_blocks.append(b)
                self.blocks.append(b)
                changed = True
                remaining_space -= b.width
            else:
                viable_blocks.pop()
        self._update_map_with_blocks(floor_blocks)
        return changed

        
    def _update_map_with_blocks(self, blocks, delete=False):
        new_number = 0 if delete else 1
        for b in blocks:
            self.block_map[self.world_height-(b.y+b.height): self.world_height-b.y, b.x:(b.x+b.width)] = new_number
    
    def can_place(self, block):
        overlap = self.block_map[self.world_height-(block.y+block.height): self.world_height-block.y, block.x: (block.x+block.width)]
        return (not overlap.any())
                    
    
    def fill_world(self, render = False):
        '''
        Semi-randomly fills world with blocks, adding a 'floor' of blocks to the next available flat surface 
        '''
        current_level = 0 #Start at bottom and work up
        while current_level <= self.world_height - 1: # Until at top
            #find floor
            while self.block_map[self.world_height - current_level - 1].all() and current_level < self.world_height: # check if level is full or reached top
                current_level += 1
            if current_level == self.world_height:
                    break
            left = 0
            while self.block_map[self.world_height - current_level - 1][left] == 1:
                left += 1
            right = left
            while right < self.world_width and self.block_map[self.world_height - current_level - 1][right] == 0:
                right += 1
            #print('fill_world_here: ' + str((current_level, left, right)))
            if not self.fill_floor_here(current_level, left, right): #fills world and returns whether world changed
                break
        
        ## check that world is filled
        self.check_full()
        
        ## optionally render world
        if render:
            draw_world(self)
            
    def add_block(self, w, h, x, y):
        '''
        Add block of specified dimensions to the world at a given location
        '''
        if (w,h) in self.base_block_dict:
            base_block = self.base_block_dict[(w,h)]
            block = Block(base_block, x, y)
            if (self.can_place(block)):
                self.blocks.append(block)
                self._update_map_with_blocks([block])
                return block
            else:
                print('Block not placed- overlap with other block')
        else:
            print('These block dimensions not supported for this World. Use:')
            print(self.block_dims)
            
    def snap_to_floor(self, w, h, x):
        
        y=0
        if (w,h) in self.base_block_dict:
            base_block = self.base_block_dict[(w,h)]
            block = Block(base_block, x, y)
            while not (self.can_place(block)):
                y += 1
                block = Block(base_block, x, y)
                
            self.blocks.append(block)
            self._update_map_with_blocks([block])
            
        return block
       
         
    def pop_block(self):
        block = self.blocks.pop()
        self._update_map_with_blocks([block], delete=True)

#     def save_to_json(self):
#         '''
#         DEPRECATED: To be replaced by get_block_dict, below
#         '''
#         block_string = []
#         for b in self.blocks:
#             block_string.append(
#                 {
#                     "width": b.width,
#                     "height": b.height,
#                     "x": b.x,
#                     "y": b.y
#                 }
#             )
        
#         return(json.dumps({
#                             "blocks": block_string
#                             }
#                           ))
    
    def get_block_dict(self):
        '''
        Input: self
        Output: returns block dictionary containing list of blocks'
                most important properties: x, y, height, width
        '''
        import json
        ## create block dictionary with most essential properties
        block_list = []
        for i,this_block in enumerate(self.blocks):
            newdict = dict()
            olddict = vars(self.blocks[i])
            for (key,value) in olddict.items():
                if key in['x','y','width','height']:
                    newdict[key] = value
            block_list.append(newdict)
        block_dict = {"blocks": block_list}
        return block_dict
        
    def populate_from_json(self, json_obj):
        '''
        Fill world object with blocks saved in a JSON format
        '''
        world_obj = json.loads(json_obj)
        for b in world_obj["blocks"]:
            self.add_block(b['width'], b['height'], b['x'], b['y'])
            
    def populate_from_block_dict(self, block_dict):
        '''
        Fill world object with blocks saved as block dictionary (very similar to populate_from_json above)
        '''
        for b in block_dict["blocks"]:
            self.add_block(b['width'], b['height'], b['x'], b['y'])           


    def populate_from_block_list(self, block_list):
        '''
        Fill world object with blocks saved as block dictionary (very similar to populate_from_json above)
        '''
        for b in block_list:
            self.add_block(b['width'], b['height'], b['x'], b['y'])             
    
    def jenga_block(self, block_number, render = False, checking = False):
        '''
        Assess stability of tower upon removal of one block
        In: index of block object in blocks list to be removed 
        Out: True if tower would be stable (i.e. no blocks would move) on removal of block, false otherwise
        Pre: world is 'full'
        Post: world unchanged. block_map and blocks only copied here
        '''
        if block_number < len(self.blocks):
            # Copy blocks and remove one
            b = self.blocks[block_number]
            updated_blocks = self.blocks[:]    # copy list of blocks
            updated_blocks.remove(b)           # remove element

            # Copy and block_map
            new_block_map = np.copy(self.block_map)     # copy block map
            new_block_map[self.world_height-(b.y+b.height): self.world_height-b.y, b.x:(b.x+b.width)] = 0 
            if render:
                print(new_block_map)

            # For blocks above b, check if there is enough floor beneath
            # Blocks in list stored in order of height, so just need to traverse tail of list to check for stability
            stable = True
            for b2 in updated_blocks[block_number:]:
                if b2.y > 0: #block stable if on floor (and avoids indexing errors)
                    y = b2.y
                    xs = list(range(b2.x, b2.x+b2.width)) # get x loc of base of block in block_map
                    support = new_block_map[(self.world_height-1)-(b2.y)+1, xs] #get the floor under block
                    # support is the space underneath the base of a block
                    stable = stable and (np.mean(support)>= 0.5) # stable if greater than half of support is 1 in blockmap
                    #if not(any(stable)) then block can slide down.
            
            if stable and not checking:
                new_world = copy.deepcopy(self)
                new_world.blocks = copy.deepcopy(updated_blocks)
                new_world.block_map = new_block_map
                if render:
                    draw_world(new_world)
                return (stable, new_world)
            
            return (stable, self)

        print('Index of block to remove out of range')     
        

    def fully_connected(self, connectivity=None):
        '''
        Check if all blocks are connected
        '''
        component_labels = measure.label(self.block_map, connectivity=connectivity)
        return np.max(component_labels) < 2
    
    def blocks_above_ground(self, n_blocks):
        '''
        Returns true if at least n_blocks are currently above ground level
        '''
        block_heights = np.array([block.y for block in self.blocks])
        blocks_above_ground = block_heights > 0
        
        return np.sum(blocks_above_ground) >= n_blocks
    
    def n_blocks_above_ground(self):
        '''
        Returns true if at least n_blocks are currently above ground level
        '''
        block_heights = np.array([block.y for block in self.blocks])
        blocks_above_ground = block_heights > 0
        
        return np.sum(blocks_above_ground)
        
    
    def two_h_two_v(self):
        '''
        WARNING: Only use if you know towers contain only 1x2 and 2x1 blocks
        Returns true if two blocks have height 1 and two blocks have height 2
        '''
        
        if len(self.blocks) != 4:
            return False
        
        block_heights = np.sort(np.array([block.height for block in self.blocks]))
        
        return (block_heights == (np.array([1,1,2,2]))).all()
    
    
def worldify(block_dicts, **kwargs):
    w = World(**kwargs)
    w.populate_from_block_list(block_dicts)
    return w


def convert_to_str(world):
    flat_world = world.flatten()
    s = [str(i) for i in list(flat_world)] 
    res = "".join(s)
    return res
