Jump n Bump

This is a game for the whole family. You are cute fluffy little bunnies
and hop on the other bunnies' heads.

At the beginning you are in the menu, where you have to jump
over the tree trunk if you want to play and walk right.
Then you'll enter the arena. The aim is to jump on the
other bunnies' heads...

a,w,d to steer Dott
arrows to steer Jiffy
j,i,l to steer Fizz
4,8,6 to steer Mijji (on the numeric pad)

Thanks to sabrewulf (chuck mason) in irc.linux.com #keen
who did port this wonderful game! find him, longislandman
and me (tarzeau) on irc.linux.com
Thanks also to longisland for working on network code
and timecop for the pack/unpacker
Thanks to florian for adding scale mode, fixing the sound
bug and having alot of patience and maintaining everything.
Thanks to ben for making patches to run it on mac os x.
Thanks to ivo for doing debian packages.

f10 change between windowed/fullscreen mode
(see the XF86Config-4, copy n paste the modeline 400x256
then add the mode "400x256" to whatever bpp you have by default, restart x)
example: add following line in Section "Monitor" of your 
/etc/X11/XF86Config (or XF86Config-4)
Modeline "400x256"     22.00  400 416 480 504  256 259 262 269 doublescan
then in Section "Screen" if your DefaultDepth is 24 do be sure you have
something like:
Modes           "1024x768" "640x480" "512x384" "400x256" "320x240"
esc/f12 exit

For compilation you will need:
do following on a debian gnu/linux system (www.debian.org)
apt-get install libsdl-dev libsdl-mixer-dev
sdl libraries are needed, you might find it at www.libsdl.org

You can find more levels at http://www.jumpbump.mine.nu/cgi-bin/jb.sh
which you can start with: jumpnbump -dat levelname.dat
there's a screensaver mode as well:
jumpnbump -fireworks -fullscreen

Network play works like this, oh well here's an example
Player 1: jumpnbump -port 7777 -net 0 ip_or_hostname_of_player2 port_of_player2
Player 2: jumpnbump -port 7777 -net 1 ip_or_hostname_of_player1 port_of_player1
just take port 7777 for all ports and hope it's open and you aren't
firewalled (it's all udp!)
You can add -net 3 and -net 4 for 3rd and 4th player, and be sure.
All the players use the same -dat level.dat
(the scoreboards is different on each player and strange things like
that, but longislandman is working on it (isn't it? longislandman? you alive?))

You can find the original dos game (which runs in dos/win9x (dosextender!))
at http://www.brainchilddesign.com/games/jumpnbump/index.html

If you like the game or have any ideas don't hesitate to contact me
gurkan@linuks.mine.nu

