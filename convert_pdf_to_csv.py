import requests
from config import bonds_encashed,bonds_purchased
import fitz
import os
import pandas as pd

if not os.path.exists('data/bonds_encashed.pdf'):
    with open('data/bonds_encashed.pdf', 'wb') as f:
        f.write(requests.get(bonds_encashed).content)

if not os.path.exists('data/bonds_purchased.pdf'):
    with open('data/bonds_purchased.pdf', 'wb') as f:
        f.write(requests.get(bonds_purchased).content)


bp = list(fitz.open('data/bonds_purchased.pdf'))
bpls = []
for i,page in enumerate(bp):
    tabs = page.find_tables()
    if tabs.tables:
        ls = tabs[0].extract()
        if i == 0:
            header = '||'.join(ls[0]).replace('\n',' ').split('||')
        bpls.extend(tabs[0].extract()[1:])
    print(i)

bpdb = pd.DataFrame(bpls,columns=header)
bpdb['Denominations'] = bpdb['Denominations'].apply(lambda x:int(x.replace(',','')))
bpdb['Name of the Purchaser'] = bpdb['Name of the Purchaser'].apply(lambda x:x.replace("'","''"))
bpdb.to_csv('data/bonds_purchased.csv',index=False)
be = list(fitz.open('data/bonds_encashed.pdf'))
bels = []
for i,page in enumerate(be):
    tabs = page.find_tables()
    if tabs.tables:
        ls = tabs[0].extract()
        if i == 0:
            header = '||'.join(ls[0]).replace('\n',' ').split('||')
        bels.extend(tabs[0].extract()[1:])
    print(i)

bedb = pd.DataFrame(bels,columns=header)
bedb['Denominations'] = bedb['Denominations'].apply(lambda x:int(x.replace(',','')))
bedb.to_csv('data/bonds_encashed.csv',index=False)



