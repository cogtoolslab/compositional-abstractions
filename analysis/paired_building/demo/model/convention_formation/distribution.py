import numpy as np

from scipy.special import logsumexp
from numpy.random import choice
from collections import defaultdict

class Distribution() :
    def __init__(self, support, probabilities, log_space = False):
        self.log_space = log_space
        self.d = {}
        for element, probability in zip(support, probabilities) :
            self.d.update({element: probability})
    
    def __str__(self) :
        return str(self.d)
 
    def copy(self) :
        return Distribution(self.support(), [self.score(k) for k in self.support()], log_space = self.log_space)
    
    def update(self, element):
        for k, val in element.items():
            if k in self.d :
                # if it already exists in the distribution, aggregate probabilities
                self.d[k] = np.logaddexp(self.d[k], val) if self.log_space else self.d[k] + val
            else : 
               # otherwise add as a new element of the distribution
                self.d[k] = val
               
    def score(self, val) :
        return self.d[val] if val in self.d else self.epsilon()
    
    def epsilon(self) :
        return np.log(0.01) if self.log_space else 0.01
    
    def support(self) :
        return list(self.d.keys())
    
    def renormalize(self) :
        Z = logsumexp(list(self.d.values())) if self.log_space else sum(self.d.values()) 
        for k, prob in self.d.items():
            self.d[k] = prob - Z if self.log_space else prob / Z
          
    def marginalize(self, f) :
        d_new = defaultdict(float)
        for k, val in self.d.items():
            d_new[f(k)] = np.logaddexp(d_new[f(k)], val) if self.log_space else d_new[f(k)] + val
        return d_new
        
    def to_logspace(self) :
        self.log_space = True
        for k, prob in self.d.items():
            self.d[k] = np.log(prob)

    def from_logspace(self) :
        self.log_space = False
        for k, prob in self.d.items():
            self.d[k] = np.exp(prob)
            
class UniformDistribution(Distribution) :
    def __init__(self, support):
        uniform_probabilities = [ 1/len(support) ] * len(support)
        super().__init__(support, uniform_probabilities)
        
class EmptyDistribution(Distribution) :
    def __init__(self):
        super().__init__([], [])