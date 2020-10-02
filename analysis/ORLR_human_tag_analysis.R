library(tidyverse)
library(lme4)
library(tidyboot)
library(ggthemes)

theme_set(theme_classic())
theme_update(# axis labels
  axis.title = element_text(size = 28),
  # tick labels
  axis.text = element_text(size = 24),
  # title 
  title = element_text(size = 24),
  legend.position = 'FALSE', 
  text = element_text(size=16), 
  element_line(size=1), 
  element_rect(size=2, color="#00000"))

primary_color = '#21606c'
secondary_color = '#22AAAA'

df= read_csv('ORLR-Justin-Julia-rating.csv')
glimpse(df)
df = df[complete.cases(df), ]
glimpse(df)
df$repNum = df$repNum +1
glimpse(df)

df = df %>% group_by(rater,repNum,trialNum,dyad,refType) %>% summarise(refExp = sum(refExp, na.rm = TRUE))

#df$block_diff = df$block_justin - df$block_julia
#mean(df$block_diff)
#hist(df$block_diff)

#df = df %>%  filter(repNum == 3 | repNum == 0)

lin = lm(data = df, refExp ~ repNum*rater*refType)
summary(lin)


interaction = df %>% 
  group_by(repNum, refType) %>% 
  summarise(mu = mean(refExp), sd = sd(refExp), n = n(), sem = sd(refExp)/sqrt(n()))
glimpse(interaction)

ggplot(interaction, aes(x=repNum, y=mu, colour=refType)) + geom_line(size = 1.5)+
  geom_errorbar(aes(ymin=mu-sem, ymax=mu+sem), width = 0, size = 1.5)+
  geom_point(size = 4) +
  theme_few() +
  xlab("repetition")+
  ylab("referring expressions")+
  theme(legend.position = 'FALSE', text = element_text(size=16),
        element_line(size=1),
        element_rect(size=2, color="#00000"))+
  scale_color_manual(values=c("#151515","#7D7D7D"))
ggsave('../results/plots/CA_ORLR20_referring_exps.pdf', width=7, height = 11, units='cm', useDingbats = F)


df_trial_total = interaction %>% group_by(repNum)


