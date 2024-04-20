import pandas as pd

be = pd.read_csv("data/bonds_encashed.csv")
be.drop_duplicates(
    inplace=True,
    subset=[
        "Date of Encashment",
        "Name of the Political Party",
        "Account no. of Political Party",
        "Prefix",
        "Bond Number",
        "Denominations",
        "Pay Branch Code",
        "Pay Teller",
    ],
)


def f(x):
    if x:
        y = x.split("/")[::-1]
        mon = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]
        return f"{y[0]}-{str(mon.index(y[1])+1).zfill(2)}-{y[2]}"
    else:
        return x


be["Date of Encashment"] = be["Date of Encashment"].apply(f)
# print(be.head())
sql_be = """
DROP DATABASE IF EXISTS bonds_dbs;

CREATE DATABASE bonds_dbs;

USE bonds_dbs;

DROP TABLE IF EXISTS `bonds_encashed`;
CREATE TABLE `bonds_encashed` (
  `DateOfEncashment` DATE,
  `NameOfThePoliticalParty` VARCHAR(100),
  `AccountNoOfPoliticalParty` VARCHAR(100),
  `BePrefix` VARCHAR(5),
  `BeBondNumber` BIGINT,
  `BeDenominations` BIGINT,
  `PayBranchCode` VARCHAR(10),
  `PayTeller` BIGINT,
  `EncashmentYear` INT,
  PRIMARY KEY (BePrefix,BeBondNumber)
);

INSERT INTO `bonds_encashed`
VALUES
"""
# (`DateOfEncashment`,`NameOfThePoliticalParty`,`AccountNoOfPoliticalParty`,`BePrefix`,`BeBondNumber`,`BeDenominations`,`PayBranchCode`,`PayTeller`)

for row in be.itertuples(index=False):
    sql_be += f"""('{row[1]}','{row[2]}','{row[3]}','{row[4]}',{row[5]},{row[6]},'{"0"*(5-len(str(row[7])))}{row[7]}',{row[8]},{row[1].split('-')[0]}),\n"""

sql_be = sql_be[:-2] + ";"
sql_be += "\n\n"

bp = pd.read_csv("data/bonds_purchased.csv")
bp["Name of the Purchaser"] = bp["Name of the Purchaser"].apply(
    lambda x: x.replace("'", "''")
)
bp["Journal Date"] = bp["Journal Date"].apply(f)
bp["Date of Purchase"] = bp["Date of Purchase"].apply(f)
bp["Date of Expiry"] = bp["Date of Expiry"].apply(f)
sql_be += """

DROP TABLE IF EXISTS `bonds_purchased`;
CREATE TABLE `bonds_purchased` (
  `ReferenceNoURN` VARCHAR(100),
  `JournalDate` DATE,
  `DateOfPurchase` DATE,
  `DateOfExpiry` DATE,
  `NameOfThePurchaser` VARCHAR(100),
  `BpPrefix` VARCHAR(5),
  `BpBondNumber` BIGINT,
  `BpDenominations` BIGINT,
  `IssueBranchCode` VARCHAR(100),
  `IssueTeller` BIGINT,
  `Status` VARCHAR(100),
  `PurchaseYear` INT,
  PRIMARY KEY (BpPrefix,BpBondNumber)
);

INSERT INTO `bonds_purchased` 
VALUES
"""

for row in bp.itertuples(index=False):
    sql_be += f"""('{"0"*(23 - len(str(row[1])))}{row[1]}','{row[2]}','{row[3]}','{row[4]}','{row[5]}','{row[6]}',{row[7]},{row[8]},'{"0"*(5-len(str(row[9])))}{row[9]}',{row[10]},'{row[11]}',{row[2].split('-')[0]}),\n"""

sql_be = sql_be[:-2] + ";"


with open("data/bonds_dbs.sql", "w") as f:
    f.write(sql_be)

#(`ReferenceNoURN`,`JournalDate`,`DateOfPurchase`,`DateOfExpiry`,`NameOfThePurchaser`,`BpPrefix`,`BpBondNumber`,`BpDenominations`,`IssueBranchCode`)