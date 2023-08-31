from numpy.random import choice
import json

# we assume all agents start with a basic mapping 
# between 'h'/'v' in the DSL and 'horizontal'/'vertical' in language
class BlockLexicon :
    def __init__(self, dsl, lexemes):
        '''
        initialize dictionary subclass
        '''
        self.unassigned_lexemes = lexemes.copy()
        self.lexemes = tuple(lexemes)
        self.dsl = dsl
        self.primitives = [k for k in dsl if k[:5] != 'chunk']
        self.chunks = [k for k in dsl if k[:5] == 'chunk']
        self.lexicon = {}
        
        for element in dsl :
            if element in ['v', 'h'] :
                adjective = 'horizontal' if element == 'h' else 'vertical'
                self.lexicon.update({element : f'place a {adjective} block.'})
            elif element[0] in ['l', 'r'] :
                distance = element.split('_')[1]
                direction = 'right' if element[0] == 'r' else 'left'
                self.lexicon.update({element : f'move to the {direction} by {distance}'})
            else :
                self.lexicon.update({element : f'place a {self.unassigned_lexemes.pop()}.'})
        
        self.utterances = set(self.lexicon.values())

    def __hash__(self):
        return hash(json.dumps(self.lexicon, sort_keys=True))

    def __str__(self):
        return json.dumps(self.lexicon, indent=4)

    def invert(self):
        '''
        invert keys and values of a dictionary d
        '''
        return {v: k for k, v in self.lexicon.items()}
    
    def dsl_to_language(self, e) :
        '''
        parse expression e written in DSL into language
        if dsl element unrecognized, choose *lexeme* at random
        '''
        return self.lexicon.get(e) if e in self.lexicon else choice(self.lexemes)
    
    def language_to_dsl(self, e) :
        '''
        parse expression e written in DSL into language
        if language unrecognized, choose *chunk* at random
        '''
        inverted_lexicon = self.invert()
        return inverted_lexicon.get(e) if e in inverted_lexicon else choice(self.chunks)