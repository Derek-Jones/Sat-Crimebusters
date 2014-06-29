# Plot number of unique MMSI making a gigen number of transmissions per day.
library(plyr)

trans=read.csv("c:/Web/Catapult/stripped.csv")

mmsi_hist=function(df)
{
hist(table(df$MMSI), breaks=100,
	main="", xlab="", ylab="")
}

par(mar=c(1,1,1,1))
par(mfcol=c(5, 6))

d_ply(trans, .(date), mmsi_hist)
