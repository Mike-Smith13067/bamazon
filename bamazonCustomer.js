var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection({
    host: "localhost",
    //set port to 3306
    port: 3306,
    //set username
    user: "root",
    //set password
    password: "",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to database");
    start();
});

// Start
function start() {
    inquirer.prompt({
        name: "begin",
        type: "confirm",
        message: "Welcome to the bamazon store! List the products for sale?"
    }).then(function (input) {
        if (input.begin === true) {
            allItems();
        } else {
            console.log("Sorry to see you leave! Please come again!!");
            connection.end();
        }
    })
}

// Disaply current products in database
// User selection
function allItems() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        inquirer.prompt({
            name: "getID",
            type: "list",
            message: "Select the ID of the item you wish to buy",
            choices: function () {
                var choices = new Array();
                for (var i = 0; i < results.length; i++) {
                    var products = results[i];
                    choices.push("ID: " + products.item_id + " Product: " + products.product_name + " Price: " + products.price + " Quantity: " + products.stock_quantity);
                }
                choices.push("Exit");
                return choices;
            }
        }).then(function (input) {
            if (input.getID === "Exit") {
                connection.end();
                return;
            } else {
                var productId = input.getID.split(" ");
                buyProduct(productId[1]);
            }
        });
    });
}

function buyProduct(id) {
    connection.query("SELECT * FROM products WHERE item_id = ?", [id], function (err, results) {
        if (err) throw err;
        inquirer.prompt({
            name: "verify",
            type: "confirm",
            message: results[0].product_name + " has been selected. Unit price is " + results[0].price + ". Is that correct?"
        }).then(function (input) {
            if (input.verify === true) {
                return true;
            } else {
                // Returns to main screen
                allItems();
            }
        }).then(function () {
            // verify only numbers entered
            var numbers = /^[0-9]+$/;
            inquirer.prompt({
                name: "quantity",
                type: "input",
                message: "Please enter the number of " + results[0].product_name + " you wish to buy (Available: " + results[0].stock_quantity + ")",
                validate: function (answer) {
                    if (answer.match(numbers)) {
                        return true;
                    } else {
                        return "Please enter a valid number";
                    }
                }
            }).then(function (answer) {
                verifyStock(results[0].item_id, answer.quantity);
            })
        });
    });
}
//verify quantity requested is less than quantity in stock
function verifyStock(id, quantity) {
    connection.query("SELECT * FROM products WHERE item_id = ?", [id], function (err, results) {
        if (err) throw err;
        var total = (results[0].price * quantity).toFixed(2);
        if (quantity > results[0].stock_quantity) {
            console.log("Sorry we do not have that many units on hand");
            buyProduct(id);
        } else {
            inquirer.prompt({
                name: "cost",
                type: "confirm",
                message: "Your total is " + total + ". Do you wish to make the purchase?"
            }).then(function (input) {
                if (input.cost === true) {
                    confirmPurchase(id, quantity, total);
                } else {
                    allItems();
                }
            })
        }
    });
}

function confirmPurchase(id, quantity, total) {
    connection.query("SELECT * FROM products WHERE item_id = ?", [id], function (err, results) {
        if (err) throw err;
        var remainingProduct = parseFloat(results[0].stock_quantity) - parseFloat(quantity);
        connection.query("UPDATE products SET? WHERE ?", [
            { stock_quantity: remainingProduct },
            { item_id: id }

        ]);
    });
    console.log("You have succesfully purchased your item(s) for " + total + ".");
    inquirer.prompt({
        name: "buyMore",
        type: "confirm",
        message: "Continue shopping?"
    }).then(function (input) {
        if (input.buyMore === true) {
            console.log("Here is the updated list of available items.");
            allItems();
        } else {
            connection.end();
        }
    });
}
// connection.connect(function(err) {
//     if (err) throw err;
//     start();
// });