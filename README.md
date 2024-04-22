# Electoral Bond Analysis Website

### Methodology:
##### Conversion of pdf to csv 
- Run [convert_pdf_to_csv.py](./convert_pdf_to_csv.py) file.
- Run [csv_to_sql.py](csv_to_sql.py) file.

> The above steps are already done, and files can be found in [data](./data/) folder.

#### Steps to run locally.
##### Adding to the database
- Import the sql file in MySQL Workbench. ![](https://i.imgur.com/I8Q0Jhv.png)
- Choose the sql dump and start import. ![](https://i.imgur.com/IdHYRDo.png)
- Run the following command in SQL File:<br>
  `CREATE USER 'assignment4'@'%' IDENTIFIED BY 'password';`<br>
  `GRANT ALL PRIVILEGES ON *.* TO 'assignment4'@'%' WITH GRANT OPTION;`

##### Activate a virtual environment (Optional)
- `pip install virtualenv`
- `virtualenv venv`
- `cd venv/Scripts`
- `activate`
- `cd ../..`

##### Run the main.py
- `pip install -r requirements.txt`
- `python main.py`
- Navigate to [http://127.0.0.1:5540](http://127.0.0.1:5540/)

### Video of working and UI [Click image]
[![Video](https://img.youtube.com/vi/9DTzZBrJkqA/maxresdefault.jpg)](https://www.youtube.com/watch?v=9DTzZBrJkqA)

### Screenshots of Questions and UI

#### First step is to join the tables (has to be done only once)
![](https://i.imgur.com/1x513j8.png)

#### Q1:
##### Search Form
![](https://i.imgur.com/1jobr11.png)<br>
##### Dropdown for parties and companies
![](https://i.imgur.com/svnoG6A.png)
##### Paginated table
![](https://i.imgur.com/WwH6cpB.png)<br>

#### Q2:
##### Dropdown Search
![](https://i.imgur.com/fhydMvg.png)<br>
##### Bar Graph
![](https://i.imgur.com/KrUm3Kp.png)<br>

#### Q3:
##### Dropdown Search + Bar graphs
![](https://i.imgur.com/J2CXUND.png)<br>

#### Q4:
##### Dropdown search + table
![](https://i.imgur.com/7TL84S2.png)
##### Pie chart
![](https://i.imgur.com/u3Qye0K.png)
##### Alluvial diagram [chartjs-sankey]
![](https://i.imgur.com/FBJ3rRV.png)

#### Q5:
##### Dropdown search + table
![](https://i.imgur.com/qyrrxQ9.png)
##### Pie chart
![](https://i.imgur.com/DmzX8Ms.png)
##### Alluvial diagram [chartjs-sankey]
![](https://i.imgur.com/zJ6QI52.png)

#### Q6:
##### Total donation recieved
![](https://i.imgur.com/CuvtUte.png)
##### Pie Chart
![](https://i.imgur.com/iKwOhGq.png)

#### Bonus 1
![](https://i.imgur.com/GllEZsv.png)


#### Bonus 2
![](https://i.imgur.com/i0N2NrM.png)

#### Bonus 3    
![](https://i.imgur.com/CVNhbwf.png)
