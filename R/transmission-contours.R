#
# Create a contour map of transmission locations

trans=read.csv("c:/Web/Catapult/stripped.csv")
trans$MMSI=NULL
trans$date=NULL
trans$time=NULL
trans$sog=NULL
trans$cog=NULL

library("KernSmooth")

# v_den=bkde2D(as.matrix(trans), bandwidth=c(1, 1), gridsize=c(1000, 400))
v_den=bkde2D(as.matrix(trans), bandwidth=c(3, 3), gridsize=c(2000, 800))
# contour(z=v_den$fhat, nlevels=20, asp=16.3/42.5)
contour(z=v_den$fhat, nlevels=30, asp=16.3/42.5)

