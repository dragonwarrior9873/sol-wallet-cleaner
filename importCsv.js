const fs = require('fs');
const { parse } = require('csv-parse/sync');

exports.readCsvSync = () => {
    let columns = [];
    const csvData = fs.readFileSync('wallets.csv', 'utf8');
    const records = parse(csvData, {
        columns: true, // Convert data to objects
        skip_empty_lines: true // Skip empty lines
      });
    for( let i = 0 ; i < records.length; i ++){
        columns.push(records[i].secretKey)
    }
    return columns;
}
