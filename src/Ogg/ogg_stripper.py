#!/usr/bin/python
import sys

if len(sys.argv) != 3:
    print "ogg_stripper.py read_file write_file"
    exit()


read_file = sys.argv[1]
write_file = sys.argv[2]
f = open(read_file,"r")

has_next_page = True
stripped =""

byte_num =0
while(has_next_page):
    ogg_pattern = f.read(4)
    print byte_num
    if ogg_pattern != "OggS":
        raise Exception("capture pattern failed at byte "+str(byte_num))

    byte_num+=4

    version = ord(f.read(1))
    if version != 0:
        raise Exception("version does not equal 0 at byte " +str(byte_num))
    byte_num+=1

    header_type = ord(f.read(1))

    if ((header_type << 3)>> 5) == 1:
        has_next_page = False
    
    byte_num+=1

    f.read(20)
    byte_num+=20

    num_segments = ord(f.read(1))

    byte_num+=1    

    page_size = 0
    for x in range(0,num_segments):
        page_size+=ord(f.read(1))
        byte_num+=1

    contents = f.read(page_size)
    byte_num+=page_size
    stripped += contents

f.close()
w = open(write_file,"w")
w.write(stripped)

    
