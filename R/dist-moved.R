#
# dist-moved.R, 29 Jun 14

library(plyr)

# How far the vessel has moved between two transmissions.
# Distance is not not scaled by size of the Earth.
dist_moved=function(df)
{
# if (nrow(df) == 1)
#   return
diff_lat=diff(df$lat)
diff_lon=diff(df$lon)
diff_dist=sqrt(diff_lat^2+diff_lon^2)

df$mdist=c(0, diff_dist)

return(df)
}


trans=read.csv("c:/Web/Catapult/stripped.csv")

# This bit takes around 7 hours on a medium speed laptop
t=ddply(trans, .(MMSI), dist_moved)
