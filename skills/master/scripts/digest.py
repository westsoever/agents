import json,sys
p=sys.argv[1]; n=int(sys.argv[2]) if len(sys.argv)>2 else 12
msgs=[]
for line in open(p):
    try: d=json.loads(line)
    except: continue
    t=d.get('type')
    if t not in ('user','assistant'): continue
    m=d.get('message',{}); c=m.get('content')
    txt=''
    if isinstance(c,str): txt=c
    elif isinstance(c,list):
        for b in c:
            if b.get('type')=='text': txt+=b['text']
    txt=txt.strip()
    if not txt or txt.startswith('<system-reminder') or txt.startswith('[SYSTEM') or 'tool_use_id' in txt: continue
    msgs.append((t,d.get('timestamp','')[:16],txt))
users=[m for m in msgs if m[0]=='user' and not m[2].startswith('<')]
print('FIRST USER:',users[0][2][:600] if users else None)
print('...')
for t,ts,x in msgs[-n:]:
    print(f'[{t} {ts}]',x[:900].replace('\n',' | '))
