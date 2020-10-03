library(tidyverse)
library(lme4)
library(tidyboot)
library(ggthemes)
#install.packages("tm")
require("tm")
library(GmAMisc)
library(tidytext)

#chiperm function
chiperm <- function(data, B=999, resid=FALSE, filter=FALSE, thresh=1.96, cramer=FALSE){
  options(warn=-1)
  
  rowTotals <- rowSums(data)
  colTotals <- colSums(data)
  
  obs.chi.value <- chisq.test(data)$statistic
  
  chistat.perm <- vector(mode = "numeric", length = B)
  chi.statistic <- function(x)  chisq.test(x)$statistic
  chistat.perm <- sapply(r2dtable(B, rowTotals, colTotals), chi.statistic)
  
  p.lowertail <- (1 + sum (chistat.perm < obs.chi.value)) / (1 + B)
  p.uppertail <- (1 + sum (chistat.perm > obs.chi.value)) / (1 + B)
  two.sided.p <- 2 * min(p.lowertail, p.uppertail)
  
  p.to.report <- ifelse(two.sided.p < 0.001, "< 0.001",
                        ifelse(two.sided.p < 0.01, "< 0.01",
                               ifelse(two.sided.p < 0.05, "< 0.05",
                                      round(two.sided.p, 3))))
  return(two.sided.p)
}

# bring in df with dyad and rep0, rep3
# create contingency table for each dyad
# pass each contingency table through chiperm
# extract p value for each

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
df = df_chat %>% 
    select(gameid, repNum, content) %>%
    filter(repNum %in% c(0,3)) %>%
    group_by(gameid, repNum) %>%
    summarise(content=paste(content, collapse=" "))
glimpse(df)

df[df$gameid == '0738-513adaa7-2548-44a4-8d01-7e2fb3ecbfd4', ]$content


my.corpus = VCorpus(VectorSource(df[df$gameid == '0738-513adaa7-2548-44a4-8d01-7e2fb3ecbfd4', ]$content))
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


chiperm(result, B = 999, resid = FALSE, filter = FALSE,
        thresh = 1.96, cramer = FALSE)

# data(assemblage)
# View(assemblage)


#TRY functino on all gameids with purr
p_list = list()
for(i in 1:length(unique(df$gameid))){
  game = unique(df$gameid)[i]
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
log(prod(p))
