from flask import Flask, request, render_template,jsonify,redirect,session
from logutil import logger
from flask_mysqldb import MySQL
from uuid import uuid4
import config as c
from functools import wraps
import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = str(uuid4())
app.config['MYSQL_HOST'] = c.host
app.config['MYSQL_USER'] = c.username
app.config['MYSQL_PASSWORD'] = c.password
app.config['MYSQL_DB'] = c.dbname
mysql = MySQL(app)

import helpers.dbf as dbf

def is_tbl_joined(fn):
    @wraps(fn)
    def decorated_view(*args, **kwargs):
        if not 'be_bp_joined' in session:
            return redirect('/')
        return fn(*args, **kwargs)
    return decorated_view

@app.route('/')
def home():
    tbls = dbf.show_tables(mysql)
    # print(tbls)
    if 'be_bp_joined' not in tbls:
        warning = 'Please click the join button before doing anything. This joins the bonds_purchased and bonds_encashed databases for faster processing.'
    else:
        warning = None
        session['be_bp_joined'] = True
    party_names = dbf.get_parties(mysql)
    purchaser_names = dbf.get_purchasers(mysql)
    return render_template('index.html',warning=warning,party_names=party_names,purchaser_names=purchaser_names)

@app.route('/join_dbs',methods=['POST'])
def join_the_dbs():
    dbf.join_both(mysql)
    session['be_bp_joined'] = True
    return redirect('/')

@is_tbl_joined
@app.route('/search_filter',methods=['POST'])
def search_filter():
    data = request.json
    res = dbf.search_filter(mysql,**data)
    res2 = []
    for i in res:
        t = []
        for j in i:
            if isinstance(j,datetime.date):
                t.append(j.strftime('%Y-%m-%d'))
            else:
                t.append(j)
        res2.append(t)
    return jsonify(res2)

@is_tbl_joined
@app.route('/search_bonddata_for_individual',methods=['POST'])
def search_bonddata_for_individual():
    data = request.json
    # print(data)
    res = dbf.get_bond_count_and_pur_val(mysql,**data)
    return jsonify(res)

@is_tbl_joined
@app.route('/search_bonddata_for_polparty',methods=['POST'])
def search_bonddata_for_polparty():
    data = request.json
    # print(data)
    res = dbf.get_bond_count_and_polparty_val(mysql,**data)
    return jsonify(res)

@is_tbl_joined
@app.route('/polparty_comapny_contri',methods=['POST'])
def polparty_comapny_contri():
    data = request.json
    # print(data)
    res = dbf.get_company_contrib_to_pol_parrty(mysql,**data)
    return jsonify(res)

@is_tbl_joined
@app.route('/company_polparty_contri',methods=['POST'])
def company_polparty_contri():
    data = request.json
    # print(data)
    res = dbf.get_pol_party_contrib_to_comany(mysql,**data)
    return jsonify(res)

@is_tbl_joined
@app.route('/amount_for_all_parties',methods=['POST'])
def amount_for_all_parties():
    res = dbf.get_amt_donated_to_all(mysql)
    return jsonify(res)

@is_tbl_joined
@app.route('/myg1',methods=['POST'])
def myg1():
    res = dbf.comany_party_amount(mysql)
    return jsonify(res)


if __name__ == "__main__":
    app.run(port=5540,debug=True)


