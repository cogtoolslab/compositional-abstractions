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
<<<<<<< HEAD

# df_block = read.csv('../results/csv/df_block.csv')
# df_chat = read.csv('../results/csv/df_chat.csv')
# df_trial = read.csv('../results/csv/df_trial.csv')
# df_exit = read.csv('../results/csv/df_exit.csv')
# #### Filter trials that don't reach criterion
# #How many dyads fulfill 75% Accuracy on 75% of trials
# games75 = df_trial %>% 
#   group_by(gameid, trialNum) %>% 
#   filter(trialScore > 75  & repNum != 'practice') %>%
#   group_by(gameid)%>% 
#   tally %>% 
#   filter(n/12 >=0.75) %>% 
#   distinct(gameid)
# 
# #How many dyads said they were confused <-- this is probably inverse coded...
# gamesConfused = df_exit %>% 
#   filter(confused == 'yes') %>% 
#   distinct(gameid)
# 
# #How many dyads said they spoke English
# gamesEnglish = df_exit %>% 
#   filter(nativeEnglish == 'yes') %>% 
#   distinct(gameid)
# 
# gamesToKeep = intersect(games75, gamesConfused, gamesEnglish)$gameid
# 
# df_chat <- df_chat %>% 
#   filter(!is.na(trialNum)) %>% 
#   subset(gameid %in% gamesToKeep)
# df_chat$repNum = as.numeric(as.character(df_chat$repNum))
# glimpse(df_chat)
# 
# #concatenate messages by repNum and dyad
# df = df_chat %>% 
#   select(gameid, repNum, content) %>% 
#   filter(repNum %in% c(0,3)) %>% 
#   group_by(gameid, repNum) %>% 
#   summarise(content=paste(content, collapse=" "))
# 
# data_wide <- spread(df, repNum, content)
# data_wide <- data_wide %>% rename(rep0 = "0", rep3 = "3") 
# glimpse(data_wide)  
# data_wide$rep3[1]
df = read_csv("JJ_content.csv")
df = df %>% 
    select(gameid, repNum, content) %>%
    filter(repNum %in% c(0,3)) %>%
    group_by(gameid, repNum) %>%
    summarise(content=paste(content, collapse=" "))
glimpse(df)

df[df$gameid == '0738-513adaa7-2548-44a4-8d01-7e2fb3ecbfd4', ]$content


my.corpus = VCorpus(VectorSource(df[df$gameid == "4909-705b801e-4ec3-4910-b180-bb7612d80f25", ]$content))
my.corpus <- tm_map(my.corpus, removePunctuation)
my.corpus = tm_map(my.corpus, content_transformer(tolower))
#my.corpus = tm_map(my.corpus, removePunctuation)
my.corpus = tm_map(my.corpus, removeWords, stopwords())
my.tdm <- TermDocumentMatrix(my.corpus)
my.dtm <- DocumentTermMatrix(my.corpus, control = list(stopwords = TRUE))

dtm <-tidy(my.dtm)
dtm %>%
  ggplot(aes(x = term, y = count, fill = factor(document))) +
  geom_bar(stat = "identity", position = "stack") +
  coord_flip()

dtm <- spread(dtm, term, count)
dtm[is.na(dtm)] <- 0
row.names(dtm) <- dtm$document
result <- dtm[-1]
row.names(result) <- dtm$document


chiperm(result, B = 999, resid = FALSE, filter = FALSE,
        thresh = 1.96, cramer = FALSE)

# data(assemblage)
# View(assemblage)


#TRY functino on all gameids with purr
p_list = list()
for(i in 1:length(unique(df$gameid))){
  game = unique(df$gameid)[i]
  print(game)
  my.corpus = VCorpus(VectorSource(df[df$gameid == game, ]$content))
  my.corpus <- tm_map(my.corpus, removePunctuation)
  my.corpus = tm_map(my.corpus, content_transformer(tolower))
  my.corpus = tm_map(my.corpus, removePunctuation)
  my.corpus = tm_map(my.corpus, removeWords, stopwords())
  my.tdm <- TermDocumentMatrix(my.corpus)
  my.dtm <- DocumentTermMatrix(my.corpus, control = list(stopwords = TRUE))
  
  dtm <- tidy(my.dtm)
  # dtm %>%
  #   ggplot(aes(x = term, y = count, fill = factor(document))) +
  #   geom_bar(stat = "identity", position = "stack") +
  #   coord_flip()
  
  dtm <- spread(dtm, term, count)
  dtm[is.na(dtm)] <- 0
  row.names(dtm) <- dtm$document
  result <- dtm[-1]
  row.names(result) <- dtm$document
  
  
  p = chiperm(result, B = 999, resid = FALSE, filter = FALSE,
          thresh = 1.96, cramer = FALSE)
  p_list <- append(p_list, list(p))
}
p_list
Reduce(min, p_list)
p = unlist(p_list, use.names=FALSE)
p
length(p)
log(prod(p))
=======
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
>>>>>>> 9041640f0957df770a8cd86decb1be12ee739949
