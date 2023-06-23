from numpy.random import choice
import json

# we assume all agents start with a basic mapping 
# between 'h'/'v' in the DSL and 'horizontal'/'vertical' in language
class BlockLexicon(dict) :
    def __init__(self, primitives, lexemes):
        '''
        initialize dictionary subclass
        '''
        dict.__init__(self)
        self.__dict__ = self
        unassigned_lexemes = lexemes.copy()
        self.lexemes = tuple(lexemes)
        
        for primitive in primitives :
            if primitive in ['v', 'h'] :
                adjective = 'horizontal' if primitive == 'h' else 'vertical'
                self.update({primitive : f'place a {adjective} block.'})
            elif primitive[0] in ['l', 'r'] :
                distance = primitive.split('_')[1]
                direction = 'right' if primitive[0] == 'r' else 'left'
                self.update({primitive : f'move to the {direction} by {distance}'})
            else :
                self.update({primitive: f'place a {unassigned_lexemes.pop()}.'})
    def __hash__(self):
        return hash(json.dumps(self, sort_keys=True))

    def invert(self):
        '''
        invert keys and values of a dictionary d
        '''
        return {v: k for k, v in self.items()}
    
    def dsl_to_language(self, e) :
        '''
        parse expression e written in DSL into language
        if dsl element unrecognized, choose at random
        '''
        unassigned_primitives = [k for k in self.keys() if k[:5] == 'chunk']
        return self.get(e) if e in self else choice(self.lexemes)
    
    def language_to_dsl(self, e) :
        '''
        parse expression e written in DSL into language
        if language unrecognized, choose at random
        '''
        inverted_lexicon = self.invert()
        unassigned_primitives = [k for k in self.keys() if k[:5] == 'chunk']
        return inverted_lexicon.get(e) if e in inverted_lexicon else choice(unassigned_primitives)