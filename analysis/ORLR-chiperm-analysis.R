library(tidyverse)
library(here)
library(lme4)
library(tidyboot)
library(ggthemes)
library(tm)
library(GmAMisc)
library(tidytext)

#chiperm function
chiperm <- function(data, B=999, thresh=1.96){
  rowTotals <- rowSums(data)
  colTotals <- colSums(data)
  
  # compute observed statistic
  obs.chi.value <- chisq.test(data)$statistic
  
  # run B different permuted
  chistat.perm <- vector(mode = "numeric", length = B)
  chi.statistic <- function(x)  chisq.test(x)$statistic
  chistat.perm <- sapply(r2dtable(B, rowTotals, colTotals), chi.statistic)
  
  p.lowertail <- (1 + sum (chistat.perm < obs.chi.value)) / (1 + B)
  p.uppertail <- (1 + sum (chistat.perm > obs.chi.value)) / (1 + B)
  two.sided.p <- 2 * min(p.lowertail, p.uppertail)
  return(two.sided.p)
}

# bring in df with dyad and rep0, rep3
# create contingency table for each dyad
# pass each contingency table through chiperm
# extract p value for each
df = read_csv(here("./results/csv/JJ_content.csv")) %>%
  select(gameid, repNum, content) %>%
  filter(repNum %in% c(0,3)) %>%
  group_by(gameid, repNum) %>%
  summarise(content=paste(content, collapse=" ")) %>%
  # filter out these weird games (B, R, NAs)
  filter(!(gameid %in% c('9387-db1af5ad-b089-48ad-a730-baee40f08177', 
                         '4909-705b801e-4ec3-4910-b180-bb7612d80f25')))

#TRY functino on all gameids with purr
ps <- purrr::map_dbl(unique(df$gameid), ~ {
  dtm <- df %>% 
    filter(gameid == .x) %>%
    pull(content) %>% 
    VectorSource() %>%
    VCorpus() %>%
    tm_map(removePunctuation) %>%
    tm_map(content_transformer(tolower)) %>%
    tm_map(removePunctuation) %>%
    tm_map(removeWords, stopwords()) %>%
    DocumentTermMatrix(control = list(stopwords = TRUE)) %>%
    tidy() %>%
    complete(document, term, fill = list(count = 0)) %>%
    spread(term, count) %>%
    column_to_rownames(var = 'document') %>%
    chiperm(result, B = 10000) %>%
    log()
})

paste('combined p-val is ', sum(ps))