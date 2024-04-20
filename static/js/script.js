// $(document).ready(function () {
//     $('#example').DataTable();
// });

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};
Chart.defaults.set('plugins.datalabels', {
    color: '#FE777B'
});
// Chart.register(SankeyController, Flow);
function join_dbs() {
    document.getElementById('spinner_join').style.display = 'block';
    document.getElementById('spinner_join').parentElement.innerHTML += 'This takes roughly 10 seconds.'
    fetch('/join_dbs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                location.reload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .then(() => {
            document.getElementById('spinner_join').style.display = 'none';
        })

}

function fixDate(date) {
    if (date == '') { return '' }
    return date
    let ds = date.split('-');
    ds.reverse()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return ds[0] + '/' + months[parseInt(ds[1] - 1)] + '/' + ds[2]
}

function fixaccno(accno) {
    if (accno == '') { return '' }
    return '*******' + accno
}

function getChoose(val) {
    if (val == 'None') { return '' }
    return val
}

function intt(x) {
    if (x == '') { return null }
    return parseInt(x)
}

function search_filter() {
    document.getElementById('spinner_filter').style.display = 'block';
    fetch('/search_filter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            partyname: getChoose(document.getElementById('party_name').value.toUpperCase()),
            purchasername: getChoose(document.getElementById('purchaser_name').value.toUpperCase()),
            urn: document.getElementById('ref_num_urn').value,
            dop: fixDate(document.getElementById('purchase_date').value),
            doexp: fixDate(document.getElementById('expiry_date').value),
            doenc: fixDate(document.getElementById('encashment_date').value),
            joud: fixDate(document.getElementById('journal_date').value),
            accno: fixaccno(document.getElementById('last_four_digits').value),
            paybracode: document.getElementById('pay_branch_code').value,
            paytel: intt(document.getElementById('pay_teller').value),
            issbracode: document.getElementById('issue_branch_code').value,
            isstel: intt(document.getElementById('issue_teller').value),
            bopre: getChoose(document.getElementById('bond_prefix').value),
            bonum: intt(document.getElementById('bond_number').value),
            denom: intt(getChoose(document.getElementById('denominations').value)),
            encashment_year: intt(getChoose(document.getElementById('encashment_year').value)),
            purchase_year: intt(getChoose(document.getElementById('purchase_year').value))
        })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(data => {
            console.log(data)
            let parent = document.getElementById('tblcol');
            try {
                parent.lastChild.remove()
            }
            catch (e) {

            }
            let table = document.createElement('table');
            table.classList.add('table', 'table-striped', 'table-bordered');
            table.id = 'result-tbl'

            let thead = document.createElement('thead')
            thead.innerHTML = `<tr>
            <th>Bond Number</th>
            <th>Date of Purchase</th>
            <th>Date of Encashment</th>
            <th>Political Party</th>
            <th>Bond Purchaser</th>
            <th>Denomination (Cr)</th>
            <th>Reference No. URN</th>
            <th>Date of Expiry</th>
            <th>Pay Teller</th>
            <th>Pay Branch Code</th>
            <th>Issue Teller</th>
            <th>Issue Branch Code</th>
            <th>Journal Date</th>
            <th>Party account number</th>
            </tr>`
            let tbody = document.createElement('tbody')
            for (let row of data) {
                let ps = parseresp(row);
                let tr = document.createElement('tr')
                tr.innerHTML = `
                <td>${ps.bond_number}</td>
                <td>${ps.dop}</td>
                <td>${ps.encashment_date}</td>
                <td>${ps.political_party}</td>
                <td>${ps.name_of_purchaser}</td>
                <td>${ps.denomination}</td>
                <td>${ps.reference_urn}</td>
                <td>${ps.doe}</td>
                <td>${ps.pay_teller}</td>
                <td>${ps.pay_branch_code}</td>
                <td>${ps.issue_teller}</td>
                <td>${ps.issue_branch_code}</td>
                <td>${ps.journal_date}</td>
                <td>${ps.accnum}</td>`
                tbody.appendChild(tr)

            };
            table.appendChild(thead);
            table.appendChild(tbody);
            parent.appendChild(table);
            $('#result-tbl').DataTable();

            $('html, body').animate({
                scrollTop: $("#result-tbl").offset().top
            }, 1000);
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .then(() => {
            document.getElementById('spinner_filter').style.display = 'none';
        })

}

function parseresp(resp) {
    // (datetime.date(2020, 1, 21).strftime('%Y-%m-%d'), 'BHARATIYA JANATA PARTY', '*******8244', 'OC', 802, 10000000, '00691', 3428540, '00125202001140000001592', datetime.date(2020, 1, 14), datetime.date(2020, 1, 14), datetime.date(2020, 1, 28), 'RAJU KUMAR SHARMA', 'OC', 802, 10000000, '00125', 2526611, 'Paid', 2020, 2020)
    let parsed = {
        'encashment_date': resp[0] || '',
        'political_party': (resp[1] || '').toTitleCase(),
        'accnum': resp[2] || '',
        'bond_number': ((resp[3] || '') + (resp[4] || '').toString()) || '',
        'denomination': resp[5] / 10000000 || '',
        'pay_branch_code': resp[6] || '',
        'pay_teller': resp[7] || '',
        'reference_urn': resp[8] || '',
        'journal_date': resp[9] || '',
        'dop': resp[10] || '',
        'doe': resp[11] || '',
        'name_of_purchaser': (resp[12] || '').toTitleCase(),
        'issue_branch_code': resp[16] || '',
        'issue_teller': resp[17] || '',
        'encashment_year': resp[19] || '',
        'purchase_year': resp[20] || ''
    }
    return parsed
}


function purchaser_bond_data() {
    document.getElementById('spinner_filter_2').style.display = 'block';
    fetch('/search_bonddata_for_individual', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            purchasername: getChoose(document.getElementById('purchaser_name2').value.toUpperCase()),
        })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(data => {
            let parent = document.getElementById('tblcol2');
            try {
                parent.lastChild.remove()
            }
            catch (e) {

            }
            try {
                Chart.getChart('q2canvas').destroy()
            }
            catch (e) {

            }
            let cavpar = document.getElementById('canvascolq2')
            try {
                cavpar.lastChild.remove()
            } catch (e) { }
            let cnv = document.createElement('canvas')
            cnv.id = 'q2canvas'
            cavpar.appendChild(cnv);
            document.getElementById('q2savebtn').style.display = 'inline';
            let table = document.createElement('table');
            table.classList.add('table', 'table-striped', 'table-bordered');
            table.id = 'result-tbl2'

            let thead = document.createElement('thead')
            thead.innerHTML = `<tr>
            <th>Bond Count</th>
            <th>Bond value (Cr)</th>
            <th>Year of Purchase</th>
            </tr>`
            let tbody = document.createElement('tbody')
            console.log(data);
            let yops = [];
            let bv = [];
            let nb = []
            data.sort(function (a, b) {
                return a[1] - b[1]
            })
            let combined_amt = 0;
            for (let row of data) {
                let tr = document.createElement('tr')
                tr.innerHTML = `
                <td>${row[0]}</td>
                <td>${row[2] / 10000000}</td>
                <td>${row[1]}</td>
                `
                combined_amt += row[2] / 10000000
                tbody.appendChild(tr)
                yops.push(row[1].toString());
                bv.push(row[2] / 10000000);
                nb.push(row[0]);

            };
            table.appendChild(thead);
            table.appendChild(tbody);
            parent.appendChild(table);
            $('#result-tbl2').DataTable();

            $('html, body').animate({
                scrollTop: $("#result-tbl2").offset().top
            }, 1000);
            document.getElementById('combinedtotal2').innerText = `Total amount donated: ₹ ${Math.round((combined_amt + Number.EPSILON) * 1000) / 1000} Cr`
            let ctx = document.getElementById('q2canvas');
            // Chart.defaults.backgroundColor = '#031633';
            // Chart.defaults.borderColor = '#0dcaf0';
            // Chart.defaults.color = '#ffffff';
            const plugin = {
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart, args, options) => {
                    const { ctx } = chart;
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = options.color || '#99ffff';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            };
            let mc = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: yops,
                    datasets: [{
                        label: 'Bond value [in Cr]',
                        data: bv,
                        borderWidth: 2,
                        borderColor: '#fff',
                        backgroundColor: '#fff',
                        type: 'line',
                    },
                    {
                        label: 'Number of bonds',
                        data: nb,
                        borderWidth: 1,
                        borderColor: '#fff',
                        backgroundColor: '#031633'
                    }]
                },
                options: {
                    scales: {
                        // y: {
                        //     beginAtZero: true
                        // }
                        x: {
                            ticks: {
                                color: '#fff', // Color of the x-axis labels
                            },
                            grid: {
                                color: '#0dcaf044', // Color of the x-axis grid lines
                            },
                            border: {
                                width: 2,
                                color: '#fff', // <-------------- Color of the x-axis
                            },
                            beginAtZero: true
                        },
                        y: {
                            ticks: {
                                color: '#fff', // Color of the x-axis labels
                            },
                            grid: {
                                color: '#0dcaf044', // Color of the x-axis grid lines
                            },
                            border: {
                                width: 2,
                                color: '#fff', // <-------------- Color of the x-axis
                            },
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: '#fff'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Bar-line chart for above purchaser',
                            color: '#fff'
                        },
                        customCanvasBackgroundColor: {
                            color: '#495057',
                        },
                        datalabels: {
                            display: 'auto',
                            align: 'top',
                            offset: 20,
                            color: '#fff',
                            backgroundColor: '#000',
                            borderRadius: 10
                        }
                    }
                },
                plugins: [plugin, ChartDataLabels],
            });

        })
        .then(() => {
            // document.getElementById("q2savebtn").href = Chart.getChart('q2canvas').toBase64Image('image/jpeg', 1);
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .then(() => {
            document.getElementById('spinner_filter_2').style.display = 'none';
        })

}

function dl(id) {
    var a = document.createElement("a");
    a.href = Chart.getChart(id).toBase64Image('image/jpeg', 1);;
    a.download = "Chart.png";
    a.click();
}

function polparty_bond_data() {
    document.getElementById('spinner_filter_3').style.display = 'block';
    fetch('/search_bonddata_for_polparty', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            party_name: getChoose(document.getElementById('pp_name').value.toUpperCase()),
        })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(data => {
            let parent = document.getElementById('tblcol3');
            try {
                parent.lastChild.remove()
            }
            catch (e) {

            }
            try {
                Chart.getChart('q3canvas').destroy()
            }
            catch (e) {

            }
            let cavpar = document.getElementById('canvascolq3')
            try {
                cavpar.lastChild.remove()
            } catch (e) { }
            let cnv = document.createElement('canvas')
            cnv.id = 'q3canvas'
            cavpar.appendChild(cnv);
            document.getElementById('q3savebtn').style.display = 'inline';
            let table = document.createElement('table');
            table.classList.add('table', 'table-striped', 'table-bordered');
            table.id = 'result-tbl3'

            let thead = document.createElement('thead')
            thead.innerHTML = `<tr>
            <th>Bond Count</th>
            <th>Bond value (Cr)</th>
            <th>Year of Purchase</th>
            </tr>`
            let tbody = document.createElement('tbody')
            // console.log(data);
            let yops = [];
            let bv = [];
            let nb = []
            let combined_amt = 0;
            data.sort(function (a, b) {
                return a[1] - b[1]
            })
            for (let row of data) {
                let tr = document.createElement('tr')
                tr.innerHTML = `
                <td>${row[0]}</td>
                <td>${row[2] / 10000000}</td>
                <td>${row[1]}</td>
                `
                combined_amt += row[2] / 10000000
                tbody.appendChild(tr)
                yops.push(row[1].toString());
                bv.push(row[2] / 10000000);
                nb.push(row[0]);

            };
            document.getElementById('combinedtotal3').innerText = `Total donation recieved: ₹ ${Math.round((combined_amt + Number.EPSILON) * 1000) / 1000} Cr`
            table.appendChild(thead);
            table.appendChild(tbody);
            parent.appendChild(table);
            $('#result-tbl3').DataTable();

            $('html, body').animate({
                scrollTop: $("#result-tbl3").offset().top
            }, 1000);

            let ctx = document.getElementById('q3canvas');
            // Chart.defaults.backgroundColor = '#031633';
            // Chart.defaults.borderColor = '#0dcaf0';
            // Chart.defaults.color = '#ffffff';
            const plugin = {
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart, args, options) => {
                    const { ctx } = chart;
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = options.color || '#99ffff';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            };
            let mc = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: yops,
                    datasets: [{
                        label: 'Bond value [in Cr]',
                        data: bv,
                        borderWidth: 2,
                        borderColor: '#fff',
                        backgroundColor: '#fff',
                        type: 'line',
                    },
                    {
                        label: 'Number of bonds',
                        data: nb,
                        borderWidth: 1,
                        borderColor: '#fff',
                        backgroundColor: '#031633'
                    }]
                },
                options: {
                    scales: {
                        // y: {
                        //     beginAtZero: true
                        // }
                        x: {
                            ticks: {
                                color: '#fff', // Color of the x-axis labels
                            },
                            grid: {
                                color: '#0dcaf044', // Color of the x-axis grid lines
                            },
                            border: {
                                width: 2,
                                color: '#fff', // <-------------- Color of the x-axis
                            },
                            beginAtZero: true
                        },
                        y: {
                            ticks: {
                                color: '#fff', // Color of the x-axis labels
                            },
                            grid: {
                                color: '#0dcaf044', // Color of the x-axis grid lines
                            },
                            border: {
                                width: 2,
                                color: '#fff', // <-------------- Color of the x-axis
                            },
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: '#fff'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Bar-line chart for above political party',
                            color: '#fff'
                        },
                        customCanvasBackgroundColor: {
                            color: '#495057',
                        },
                        datalabels: {
                            display: 'auto',
                            align: 'top',
                            offset: 20,
                            color: '#fff',
                            backgroundColor: '#000',
                            borderRadius: 10
                        }
                    }
                },
                plugins: [plugin, ChartDataLabels],
            });

        })
        .catch(error => {
            console.error('Error:', error);
        })
        .then(() => {
            document.getElementById('spinner_filter_3').style.display = 'none';
        })

}

const getColor = () => {
    const bright = 200;

    const ran = () => Math.floor(Math.random() * (255 - bright) + bright);

    const red = ran();
    const green = ran();
    const blue = ran();

    // Convert RGB values to hex
    const rgbToHex = (channel) => {
        const hex = channel.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };

    const hexRed = rgbToHex(red);
    const hexGreen = rgbToHex(green);
    const hexBlue = rgbToHex(blue);

    return `#${hexRed}${hexGreen}${hexBlue}`;
};

function polparty_comapny_contri() {

    let pptmp = getChoose(document.getElementById('ppnameq4').value.toUpperCase());
    if (pptmp == '') { return }
    document.getElementById('spinner_filter_4').style.display = 'block';
    fetch('/polparty_comapny_contri', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            party_name: getChoose(document.getElementById('ppnameq4').value.toUpperCase()),
        })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(data => {
            let parent = document.getElementById('tblcol4');
            try {
                parent.lastChild.remove()
            }
            catch (e) {

            }
            try {
                Chart.getChart('q4canvas').destroy()
            }
            catch (e) {

            }
            let cavpar = document.getElementById('canvascolq4')
            try {
                cavpar.lastChild.remove()
            } catch (e) { }
            let cnv = document.createElement('canvas')
            cnv.id = 'q4canvas'
            cavpar.appendChild(cnv);
            document.getElementById('q4savebtn').style.display = 'inline';
            let table = document.createElement('table');
            table.classList.add('table', 'table-striped', 'table-bordered');
            table.id = 'result-tbl4'

            let thead = document.createElement('thead')
            thead.innerHTML = `<tr>
            <th>Bond Count</th>
            <th>Donated Value (Cr)</th>
            <th class="text-center">Donator Name<br>(Bond Purchaser Name)</th>
            </tr>`
            let tbody = document.createElement('tbody')
            // console.log(data);
            let donator_name = [];
            let dv = [];
            let num_bonds = []
            data.sort(function (a, b) {
                return b[1] - a[1]
            })
            let combined_amt = 0;
            for (let row of data) {
                let tr = document.createElement('tr')
                tr.innerHTML = `
                <td>${row[0]}</td>
                <td>${row[1] / 10000000}</td>
                <td>${(row[2] || 'Unknown').toTitleCase()}</td>
                `
                combined_amt += row[1] / 10000000
                tbody.appendChild(tr)
                donator_name.push((row[2] || 'Unknown').toTitleCase());
                dv.push(row[1] / 10000000);
                num_bonds.push(row[0]);

            };
            document.getElementById('combinedtotal4').innerText = `Total donation recieved: ₹ ${Math.round((combined_amt + Number.EPSILON) * 1000) / 1000} Cr`
            table.appendChild(thead);
            table.appendChild(tbody);
            parent.appendChild(table);
            $('#result-tbl4').DataTable();

            $('html, body').animate({
                scrollTop: $("#result-tbl4").offset().top
            }, 1000);

            let ctx = document.getElementById('q4canvas');
            // Chart.defaults.backgroundColor = '#031633';
            // Chart.defaults.borderColor = '#0dcaf0';
            // Chart.defaults.color = '#ffffff';
            const plugin = {
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart, args, options) => {
                    const { ctx } = chart;
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = options.color || '#99ffff';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            };
            let mc = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: donator_name,
                    datasets: [{
                        label: 'Donated Value',
                        data: dv
                    },
                    ]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#fff'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Pie Chart describing amount of money donated by various companies/individuals',
                            color: '#fff'
                        },
                        customCanvasBackgroundColor: {
                            color: '#495057',
                        },
                        datalabels: {
                            display: 'auto',
                            color: '#fff',
                            backgroundColor: '#000',
                            borderRadius: 10
                        }
                    }
                },
                plugins: [plugin, ChartDataLabels],
            });

            return data

        }).then(data => {

            try {
                Chart.getChart('q4canvassankey').destroy()
            }
            catch (e) {

            }
            let cavpar = document.getElementById('canvascolq4sankey')
            try {
                cavpar.lastChild.remove()
            } catch (e) { }
            let cnv = document.createElement('canvas')
            cnv.id = 'q4canvassankey'
            cnv.height = "800px";
            cavpar.appendChild(cnv);
            document.getElementById('q4savebtnsankey').style.display = 'inline';

            let ctx = document.getElementById('q4canvassankey');
            const plugin = {
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart, args, options) => {
                    const { ctx } = chart;
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = options.color || '#99ffff';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            };

            // console.log(totl)
            let ddset = [];
            for (let row of data) {
                let obj = {
                    from: (row[2] || 'Unknown').toTitleCase(),
                    to: pptmp.toTitleCase(),
                    flow: parseInt(
                        parseInt(row[1] / 10000000)
                    ),

                }
                ddset.push(obj)
            }
            // console.log(ddset)

            let mc = new Chart(ctx, {

                type: 'sankey',
                data: {
                    datasets: [{
                        label: 'in Cr',
                        data: ddset
                    }],
                    colorFrom: (c) => getColor(),
                    colorTo:  (c) => getColor(),
                },
                options: {
                    response: true,
                    // maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            // position: 'bottom',
                            // labels: {
                            //     color: '#fff'
                            // }
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Sankey Diagram of Donations (in Cr)',
                            color: '#fff'
                        },
                        customCanvasBackgroundColor: {
                            color: '#7d8b8c',
                        }

                    }
                },
                plugins: [plugin],
            });


        })

        .then(() => {
            document.getElementById('spinner_filter_4').style.display = 'none';

        })
        .catch(error => {
            console.error('Error:', error);
        })

}


function company_polparty_contri() {

    let pptmp = getChoose(document.getElementById('comanyname5').value.toUpperCase());
    if (pptmp == '') { return }
    document.getElementById('spinner_filter_5').style.display = 'block';
    fetch('/company_polparty_contri', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            purchaser_name: getChoose(document.getElementById('comanyname5').value.toUpperCase()),
        })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(data => {
            let parent = document.getElementById('tblcol5');
            try {
                parent.lastChild.remove()
            }
            catch (e) {

            }
            try {
                Chart.getChart('q5canvas').destroy()
            }
            catch (e) {

            }
            let cavpar = document.getElementById('canvascolq5')
            try {
                cavpar.lastChild.remove()
            } catch (e) { }
            let cnv = document.createElement('canvas')
            cnv.id = 'q5canvas'
            cavpar.appendChild(cnv);
            document.getElementById('q5savebtn').style.display = 'inline';
            let table = document.createElement('table');
            table.classList.add('table', 'table-striped', 'table-bordered');
            table.id = 'result-tbl5'

            let thead = document.createElement('thead')
            thead.innerHTML = `<tr>
            <th>Bond Count</th>
            <th>Donated Value (Cr)</th>
            <th class="text-center">Donator Name<br>(Bond Purchaser Name)</th>
            </tr>`
            let tbody = document.createElement('tbody')
            // console.log(data);
            let donator_name = [];
            let dv = [];
            let num_bonds = []
            data.sort(function (a, b) {
                return b[1] - a[1]
            })
            let combined_amt = 0;
            for (let row of data) {
                let tr = document.createElement('tr')
                tr.innerHTML = `
                <td>${row[0]}</td>
                <td>${row[1] / 10000000}</td>
                <td>${(row[2] || 'Unknown').toTitleCase()}</td>
                `
                combined_amt += row[1] / 10000000
                tbody.appendChild(tr)
                donator_name.push((row[2] || 'Unknown').toTitleCase());
                dv.push(row[1] / 10000000);
                num_bonds.push(row[0]);

            };
            document.getElementById('combinedtotal5').innerText = `Total amount donated: ₹ ${Math.round((combined_amt + Number.EPSILON) * 1000) / 1000} Cr`
            table.appendChild(thead);
            table.appendChild(tbody);
            parent.appendChild(table);
            $('#result-tbl5').DataTable();

            $('html, body').animate({
                scrollTop: $("#result-tbl5").offset().top
            }, 1000);

            let ctx = document.getElementById('q5canvas');
            // Chart.defaults.backgroundColor = '#031633';
            // Chart.defaults.borderColor = '#0dcaf0';
            // Chart.defaults.color = '#ffffff';
            const plugin = {
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart, args, options) => {
                    const { ctx } = chart;
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = options.color || '#99ffff';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            };
            let mc = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: donator_name,
                    datasets: [{
                        label: 'Donated Value',
                        data: dv
                    },
                    ]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: '#fff'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Pie Chart describing amount of money donated to various political parties by above individual',
                            color: '#fff'
                        },
                        customCanvasBackgroundColor: {
                            color: '#495057',
                        },
                        datalabels: {
                            display: 'auto',
                            color: '#fff',
                            backgroundColor: '#000',
                            borderRadius: 10
                        }
                    }
                },
                plugins: [plugin, ChartDataLabels],
            });
            return data
        }).then(data=>{

            try {
                Chart.getChart('q5canvassankey').destroy()
            }
            catch (e) {

            }
            let cavpar = document.getElementById('canvascolq5sankey')
            try {
                cavpar.lastChild.remove()
            } catch (e) { }
            let cnv = document.createElement('canvas')
            cnv.id = 'q5canvassankey'
            cnv.height = "800px";
            cavpar.appendChild(cnv);
            document.getElementById('q5savebtnsankey').style.display = 'inline';

            let ctx = document.getElementById('q5canvassankey');
            const plugin = {
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart, args, options) => {
                    const { ctx } = chart;
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = options.color || '#99ffff';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            };

            // console.log(totl)
            let ddset = [];
            for (let row of data) {
                let obj = {
                    from: pptmp.toTitleCase(),
                    to: (row[2] || 'Unknown').toTitleCase(),
                    flow: parseInt(
                        parseInt(row[1] / 10000000)
                    ),

                }
                ddset.push(obj)
            }
            // console.log(ddset)

            let mc = new Chart(ctx, {

                type: 'sankey',
                data: {
                    datasets: [{
                        label: 'in Cr',
                        data: ddset
                    }],
                    colorFrom: (c) => getColor(),
                    colorTo:  (c) => getColor(),
                },
                options: {
                    response: true,
                    // maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            // position: 'bottom',
                            // labels: {
                            //     color: '#fff'
                            // }
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Sankey Diagram of Purchases (in Cr)',
                            color: '#fff'
                        },
                        customCanvasBackgroundColor: {
                            color: '#7d8b8c',
                        }

                    }
                },
                plugins: [plugin],
            });



        })
        .catch(error => {
            console.error('Error:', error);
        })
        .then(() => {
            document.getElementById('spinner_filter_5').style.display = 'none';
        })

}


function amount_for_all_parties() {

    fetch('/amount_for_all_parties', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(data => {
            let parent = document.getElementById('tblcol6');
            try {
                parent.lastChild.remove()
            }
            catch (e) {

            }
            try {
                Chart.getChart('q6canvas').destroy()
            }
            catch (e) {

            }
            let cavpar = document.getElementById('canvascolq6')
            try {
                cavpar.lastChild.remove()
            } catch (e) { }
            let cnv = document.createElement('canvas')
            cnv.id = 'q6canvas'
            cavpar.appendChild(cnv);
            document.getElementById('q6savebtn').style.display = 'inline';
            let table = document.createElement('table');
            table.classList.add('table', 'table-striped', 'table-bordered');
            table.id = 'result-tbl6'

            let thead = document.createElement('thead')
            thead.innerHTML = `<tr>
            <th>Party Name</th>
            <th>Donation Recieved (Cr)</th>
            </tr>`
            let tbody = document.createElement('tbody')
            // console.log(data);
            let donrcvd = [];
            let pname = [];
            data.sort(function (a, b) {
                return b[0] - a[0]
            })
            let combined_amt = 0;
            for (let row of data) {
                let tr = document.createElement('tr')
                tr.innerHTML = `
                <td>${row[1]}</td>
                <td>${row[0] / 10000000}</td>
                `
                combined_amt += row[0] / 10000000
                tbody.appendChild(tr)
                donrcvd.push(row[0] / 10000000);
                pname.push(row[1]);

            };
            document.getElementById('combinedtotal6').innerText = `Total amount recieved by all parties: ₹ ${Math.round((combined_amt + Number.EPSILON) * 1000) / 1000} Cr`
            table.appendChild(thead);
            table.appendChild(tbody);
            parent.appendChild(table);
            $('#result-tbl6').DataTable();

            let ctx = document.getElementById('q6canvas');
            // Chart.defaults.backgroundColor = '#031633';
            // Chart.defaults.borderColor = '#0dcaf0';
            // Chart.defaults.color = '#ffffff';
            const plugin = {
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart, args, options) => {
                    const { ctx } = chart;
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = options.color || '#99ffff';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            };
            let mc = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: pname,
                    datasets: [{
                        label: 'Donation Recieved',
                        data: donrcvd
                    },
                    ]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#fff'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Pie Chart describing money recieved by various political parties',
                            color: '#fff'
                        },
                        customCanvasBackgroundColor: {
                            color: '#495057',
                        },
                        datalabels: {
                            display: 'auto',
                            color: '#fff',
                            backgroundColor: '#000',
                            borderRadius: 10
                        }
                    }
                },
                plugins: [plugin, ChartDataLabels],
            });
            return data
        })
        .catch(error => {
            console.error('Error:', error);
        })

}
amount_for_all_parties()


function myg1() {

    fetch('/myg1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(data => {
            try {
                Chart.getChart('mycnv1').destroy()
            }
            catch (e) {

            }
            let cavpar = document.getElementById('myg1')
            try {
                cavpar.lastChild.remove()
            } catch (e) { }
            let cnv = document.createElement('canvas')
            cnv.id = 'mycnv1'
            cnv.style.height = "100vh"
            cavpar.appendChild(cnv);
            document.getElementById('myg1svbtn').style.display = 'inline';

            data.sort(function (a, b) {
                return b[2] - a[2]
            })

            let ctx = document.getElementById('mycnv1');
            const plugin = {
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart, args, options) => {
                    const { ctx } = chart;
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = options.color || '#99ffff';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            };
            let totl = 0;
            for (let row of data) {
                totl += parseInt(row[2])
            }
            // console.log(totl)
            let ddset = [];
            for (let row of data) {
                let obj = {
                    from: (row[0] || 'Unknown').toTitleCase(),
                    to: (row[1] || 'Unknown').toTitleCase(),
                    flow: parseInt(
                        parseInt(row[2]) * 100 / totl
                    ),

                }
                ddset.push(obj)
            }
            // console.log(ddset)
            let mc = new Chart(ctx, {

                type: 'sankey',
                data: {
                    datasets: [{
                        label: 'My sankey',
                        data: ddset,
                        // colorMode:'gradient'
                    }]

                },
                options: {
                    response: true,
                    // maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            // position: 'bottom',
                            // labels: {
                            //     color: '#fff'
                            // }
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Pie Chart describing money recieved by various political parties',
                            color: '#fff'
                        },
                        customCanvasBackgroundColor: {
                            color: '#495057',
                        }

                    }
                },
                plugins: [plugin],
            });

        })
        .catch(error => {
            console.error('Error:', error);
        })

}
