library(tidyverse)
library(lme4)

df = read_csv('justin_julia_tag.csv')
glimpse(df)

#df$block_diff = df$block_justin - df$block_julia
#mean(df$block_diff)
#hist(df$block_diff)
df = df %>%  filter(repNum == 3 | repNum == 0)

lin = lm(data = df, refExp ~ repNum*rater*expType)
summary(lin)


interaction = df %>% group_by(repNum, expType) %>% summarise(mu = mean(refExp))
View(interaction)

ggplot(interaction) + geom_line(aes(x=repNum, y=mu, colour=expType))


