var mysql = require("mysql");
var inquirer = require("inquirer");


//Connect to the database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

//Check for errors
connection.connect(function(err) {
    if (err) throw err;
    displayAll();
});

function displayAll() {
    inquirer
        .prompt(
    {
        name: "buyItem",
        type: "list",
        message: "Would you like to view available items?",
        choices: ["Yes", "No"],
    })
    .then(function(answer) {
        var buyItem = answer.buyItem;
        if (buyItem === "Yes") {
            var query = "SELECT * FROM bamazon.products";
            connection.query(query, function(err, res) {
                for (var i = 0; i < res.length; i++) {
                  console.log("ID: " + res[i].item_id + " | Product: " + res[i].product_name + " | Price: $" + res[i].price + " | Quantity in Stock: " + res[i].stock_quantity);
                }
            });
            inquirer
                .prompt(
            {
                name: "purchase",
                type: "list",
                message: "Would you like to purchase an item?",
                choices: ["Yes", "No"],
            })
            .then(function(answer) {
                var purchase = answer.purchase;
                    if (purchase === "Yes") {
                        runSearch();
                    } else {
                        console.log("Come back later!");
                    }
            });
        } else {
            console.log("Come back later!");
            
        }
    });
}

function runSearch() {
  inquirer
    .prompt([
        {
            name: "search",
            type: "input",
            message: "ID of the product you would like to buy?"
        }, 
        {
            name: "quantity",
            type: "input",
            message: "How many would you like?"
        }
      ])
      .then(function(answer) {
        var search = answer.search;
        var quantity = answer.quantity;
        var query = 'SELECT item_id, product_name, price, stock_quantity FROM bamazon.products WHERE ?';
        connection.query(query, {item_id:search}, function(err, res) {
            if (res.length == 0) {
                console.log("Item Doesn't exist");
            }
            if (res[0].stock_quantity >= quantity) {
                console.log(res[0].stock_quantity);
                console.log(quantity);
                var updateQuantity = res[0].stock_quantity - quantity;
                console.log('Your total for ' + res[0].product_name + ' is $' + (quantity * res[0].price).toFixed(2));
                connection.query('UPDATE bamazon.products SET ? WHERE ?', 
                    [{
                        stock_quantity: updateQuantity
                    },
                    {
                        item_id: search
                    }]);
            } else {
                console.log("Insufficient quantity!");
                console.log("Avail quantity: " + res[0].stock_quantity);
                console.log("Amount you want: " + quantity);
            }
            displayAll();
        })
    });
}