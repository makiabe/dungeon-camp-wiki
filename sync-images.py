from pathlib import Path
from PIL import Image
import json,sys
out=Path(__file__).resolve().parent;root=Path(sys.argv[1] if len(sys.argv)>1 else '../DungeonCamp-iOS/dist')
chars=json.loads((out/'source-characters.json').read_text());sheet=Image.new('RGBA',(192*12,192*12));cache={}
for i,c in enumerate(chars):
 a=c.get('art',{});src=a.get('src','assets/event-characters.png' if a.get('atlas')=='event' else 'assets/characters.png');im=cache.setdefault(src,Image.open(root/src).convert('RGBA'));w,h=im.size
 if a.get('frames'):x,y,cw,ch=a['frames'][0]
 elif a.get('atlas')=='event':
  band=a.get('bands',[[180,530]])[0];x=0;y=band[0]*h/a.get('baseHeight',1024);cw=w/8;ch=(band[1]-band[0])*h/a.get('baseHeight',1024)
 elif a.get('atlas') in ['expansion','limited','reinforcements']:
  bounds=a.get('rowBounds',[a.get('row',0)/7,(a.get('row',0)+1)/7]);x=0;y=bounds[0]*h;cw=w/8;ch=(bounds[1]-bounds[0])*h
 else:
  b=[0,184,355,522,695,853,1024];row=c.get('spriteRow',i);x=0;y=b[row]*h/1024;cw=w/8;ch=(b[row+1]-b[row])*h/1024
 crop=im.crop(tuple(round(v) for v in (x,y,x+cw,y+ch)));bbox=crop.getbbox()
 if bbox:crop=crop.crop(bbox)
 crop.thumbnail((166,172));sheet.alpha_composite(crop,(i%12*192+(192-crop.width)//2,i//12*192+182-crop.height))
sheet.save(out/'portraits.webp',quality=90)
for p in (root/'assets/events').glob('*.png'):
 im=Image.open(p).convert('RGB');im.thumbnail((1000,563));im.save(out/(p.stem+'.webp'),quality=82)
for p in root.glob('assets/dungeon-*.png'):
 im=Image.open(p).convert('RGB');im.thumbnail((900,600));im.save(out/(p.stem+'.webp'),quality=80)
print('Portrait atlas and event illustrations exported')
