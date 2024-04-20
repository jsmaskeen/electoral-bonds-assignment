from flask_mysqldb import MySQL, cursors

curobj = cursors.Cursor


def f(mysql: MySQL):
    cursor = mysql.connection.cursor()
    print(type(cursor))
    cursor.execute("select * from bonds_encashed")
    data = cursor.fetchone()
    print(data)
    cursor.close()


def join_both(mysql: MySQL):
    cur: curobj = mysql.connection.cursor()
    cur.execute(
        """
create table if not exists be_bp_joined as 
(select DateOfEncashment,
NameOfThePoliticalParty,
AccountNoOfPoliticalParty,
BePrefix,BeBondNumber,BeDenominations,
PayBranchCode,PayTeller,
ReferenceNoURN,JournalDate,DateOfPurchase,
DateOfExpiry,NameOfThePurchaser,BpPrefix,
BpBondNumber,BpDenominations,IssueBranchCode,
IssueTeller,Status,EncashmentYear,PurchaseYear
from bonds_encashed be left join bonds_purchased bp on be.BeBondNumber = bp.BpBondNumber and be.BePrefix = bp.BpPrefix
union
select DateOfEncashment,
NameOfThePoliticalParty,
AccountNoOfPoliticalParty,
BePrefix,BeBondNumber,BeDenominations,
PayBranchCode,PayTeller,
ReferenceNoURN,JournalDate,DateOfPurchase,
DateOfExpiry,NameOfThePurchaser,BpPrefix,
BpBondNumber,BpDenominations,IssueBranchCode,
IssueTeller,Status,EncashmentYear,PurchaseYear
from bonds_encashed be right join bonds_purchased bp on be.BeBondNumber = bp.BpBondNumber and be.BePrefix = bp.BpPrefix
);"""
    )
    cur.close()


def show_tables(mysql: MySQL):
    cur: curobj = mysql.connection.cursor()
    cur.execute("show tables;")
    d = cur.fetchall()
    cur.close()
    return [i[0] for i in d]


def get_parties(mysql: MySQL):
    cur: curobj = mysql.connection.cursor()
    cur.execute("select distinct NameOfThePoliticalParty from bonds_encashed;")
    d = cur.fetchall()
    cur.close()
    return [i[0].title() for i in d]


def get_purchasers(mysql: MySQL):
    cur: curobj = mysql.connection.cursor()
    cur.execute("select distinct NameOfThePurchaser from bonds_purchased;")
    d = cur.fetchall()
    cur.close()
    return [i[0].title() for i in d]


def search_filter(
    mysql,
    partyname=None,
    purchasername=None,
    urn=None,
    dop=None,
    doexp=None,
    doenc=None,
    joud=None,
    accno=None,
    paybracode=None,
    paytel=None,
    issbracode=None,
    isstel=None,
    bopre=None,
    bonum=None,
    denom=None,
    encashment_year=None,
    purchase_year=None,
):
    cur: curobj = mysql.connection.cursor()
    if (
        not partyname
        and not purchasername
        and not urn
        and not dop
        and not doexp
        and not doenc
        and not joud
        and not accno
        and not paybracode
        and not paytel
        and not issbracode
        and not isstel
        and not bopre
        and not bonum
        and not denom
        and not encashment_year
        and not purchase_year
    ):
        cur.execute("select * from be_bp_joined;")
    else:
        query = "select * from be_bp_joined where "
        if partyname:
            query += f"NameOfThePoliticalParty='{partyname}' and "
        if purchasername:
            query += f"NameOfThePurchaser='{purchasername}' and "
        if urn:
            query += f"ReferenceNoURN='{urn}' and "
        if dop:
            query += f"DateOfPurchase='{dop}' and "
        if doexp:
            query += f"DateOfExpiry='{doexp}' and "
        if doenc:
            query += f"DateOfEncashment='{doenc}' and "
        if joud:
            query += f"JournalDate='{joud}' and "
        if accno:
            query += f"AccountNoOfPoliticalParty='{accno}' and "
        if paybracode:
            query += f"PayBranchCode='{paybracode}' and "
        if paytel:
            query += f"PayTeller={paytel} and "
        if issbracode:
            query += f"IssueBranchCode='{issbracode}' and "
        if isstel:
            query += f"IssueTeller={isstel} and "
        if bopre:
            query += f"BePrefix='{bopre}' and "
        if bonum:
            query += f"BeBondNumber={bonum} and "
        if denom:
            query += f"BeDenominations={denom} and "
        if encashment_year:
            query += f"EncashmentYear={encashment_year} and "
        if purchase_year:
            query += f"PurchaseYear={purchase_year} and "

        cur.execute(query[:-5])

    d = cur.fetchall()
    cur.close()
    return d


def get_bond_count_and_pur_val(mysql, purchasername=None):
    query = f"""select count(*),PurchaseYear, sum(BpDenominations)
from bonds_purchased where PurchaseYear and BpDenominations """
    if purchasername:
        query += f'and NameOfThePurchaser="{purchasername}" '
    query += "group by PurchaseYear ;"
    cur: curobj = mysql.connection.cursor()
    cur.execute(query)
    d = cur.fetchall()
    cur.close()
    return d


def get_bond_count_and_polparty_val(mysql, party_name=None):
    query = f"""select count(*),EncashmentYear, sum(BeDenominations)
from bonds_encashed where EncashmentYear and BeDenominations """
    if party_name:
        query += f'and NameOfThePoliticalParty="{party_name}" '
    query += "group by EncashmentYear ;"
    cur: curobj = mysql.connection.cursor()
    cur.execute(query)
    d = cur.fetchall()
    cur.close()
    return d


def get_company_contrib_to_pol_parrty(mysql, party_name=None):
    query = f"""
 select count(BeBondNumber),
 sum(BeDenominations),
 NameOfThePurchaser
 from be_bp_joined where BeBondNumber
 and NameOfThePoliticalParty="{party_name}"
 group by NameOfThePurchaser;
"""
    cur: curobj = mysql.connection.cursor()
    cur.execute(query)
    d = cur.fetchall()
    cur.close()
    return d

def get_pol_party_contrib_to_comany(mysql, purchaser_name=None):
    query = f"""select count(BpBondNumber),
 sum(BpDenominations),
 NameOfThePoliticalParty
 from be_bp_joined where BpBondNumber
 and NameOfThePurchaser="{purchaser_name}"
 group by NameOfThePoliticalParty;
"""
    cur: curobj = mysql.connection.cursor()
    cur.execute(query)
    d = cur.fetchall()
    cur.close()
    return d

def get_amt_donated_to_all(mysql):
    query = """select sum(BeDenominations),
NameOfThePoliticalParty
from bonds_encashed
where BeBondNumber
group by NameOfThePoliticalParty;
"""
    cur: curobj = mysql.connection.cursor()
    cur.execute(query)
    d = cur.fetchall()
    cur.close()
    return d

def comany_party_amount(mysql):
    query = """select NameOfThePurchaser,
NameOfThePoliticalParty,
sum(BpDenominations)
from be_bp_joined
where BpDenominations
group by NameOfThePurchaser,
NameOfThePoliticalParty;
"""
    cur: curobj = mysql.connection.cursor()
    cur.execute(query)
    d = cur.fetchall()
    cur.close()
    return d

def bonus1_q(mysql):
    query = """select sum(BeDenominations),NameOfThePoliticalParty from be_bp_joined
where BpBondNumber is null
group by NameOfThePoliticalParty;
"""
    cur: curobj = mysql.connection.cursor()
    cur.execute(query)
    d = cur.fetchall()
    cur.close()
    return d

def bonus2_q(mysql):
    query = """select count(BpDenominations),
sum(BpDenominations),BpDenominations
from bonds_purchased
group by BpDenominations;
"""
    cur: curobj = mysql.connection.cursor()
    cur.execute(query)
    d = cur.fetchall()
    cur.close()
    return d


def bonus3_q(mysql):
    query = """select * from 
(select sum(BeDenominations) as bjp,NameOfThePurchaser from be_bp_joined where NameOfThePoliticalParty="BHARATIYA JANATA PARTY" group by NameOfThePurchaser) as m
inner join
(select sum(BeDenominations) as congress,NameOfThePurchaser from be_bp_joined where NameOfThePoliticalParty="PRESIDENT, ALL INDIA CONGRESS COMMITTEE" group by NameOfThePurchaser) as t
using (NameOfThePurchaser);
"""
    cur: curobj = mysql.connection.cursor()
    cur.execute(query)
    d = cur.fetchall()
    cur.close()
    ls = []
    for row in d:
        t = []
        t.append(row[0])
        vv = get_comp_donation(mysql,row[0])
        t.append(row[1]*100/vv)
        t.append(row[2]*100/vv)
        t.append(row[1]+row[2])
        ls.append(t)
    ls.sort(key = lambda x:x[3],reverse=True)
    return ls

def get_comp_donation(mysql,compname):
    query = f"""select sum(BpDenominations) from bonds_purchased where NameOfThePurchaser="{compname}";
"""
    cur: curobj = mysql.connection.cursor()
    cur.execute(query)
    d = cur.fetchall()
    cur.close()
    # print(d)
    return int(d[0][0])