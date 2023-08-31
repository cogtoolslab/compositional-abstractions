import utilities
import render

def parse(s, base_dsl_only = False, verbose = False):
    '''
    Converts a program in lambda format (i.e. from Dreamcoder enumeration) into a sequence of commands, 
        possibly including learned chunks.
        
    base_dsl_only: output program in terms of base dsl commands only, 
                    rather than printing names of learned chunks e.g. 'chunk_8'

    # demo string without chunks to check hs and vs
    >>> s = '(lambda ((lambda (2x1 (left 4 ((lambda (2x1 (left 1 (1x2 (1x2 $0))))) $0)))) (right 9 (#(lambda (1x2 (right 6 (1x2 (left 5 (2x1 (right 4 (2x1 $0)))))))) (left 9 $0)))))'
    >>> parse(s) 
    'h l_4 h l_1 v v r_9 chunk_Pi l_9'
    
    '''    
    pre_parse = s
    s = utilities.parseSExpression(s)

    # print(s)
    
    def p(e):
        # print(e)
        if isinstance(e,list):
            if e[0] == '#':
                assert len(e) == 2
                if base_dsl_only:
                    return(p(e[1]))
                else:
                    try:
                        return 'chunk_' + render.lookup[str(utilities.unparseSExpression(e[1]))][0].name + ' '
                    except:
                        print(str(utilities.unparseSExpression(e[1])))
                        return 'chunk_unknown_'

            if e[0] == 'lambda':
                assert len(e) == 2
                return p(e[1]) # dig to see what else is in lambda 
            if e[0] == 'left':
                if (e[1] == '$1') or (e[1] == '$0'):
                    return ''
                else:
                    return 'l_' + e[1] + ' ' + (p(e[2:]))
            if e[0] == 'right': 
                if (e[1] == '$1') or (e[1] == '$0'):
                    return 'r_1 ' # hacky solution for dealing with degenerate chunks in w=1.5
                    # return ''
                else:
                    return 'r_' + e[1] + ' ' + (p(e[2:]))
            if e[0] == '1x2': return 'v ' + (p(e[1:]))
            if e[0] == '2x1': return 'h ' + (p(e[1:]))
            f = ''
            for x in e:
                f = f + p(x)
            return f
        assert isinstance(e,str)
        if e[0] == '1x2': return 'v ' + (p(e[1:]))
        if e[0] == '2x1': return 'h ' + (p(e[1:]))
        if e == '$0': return ''
        if e == '$1': return ''
        if e == '1': return '' # hacky solution for dealing with degenerate chunks in w=1.5
        # print(pre_parse)
        raise ValueError((s, e))
        
        
    parsed = p(s)[:-1]
    
    return parsed