const playgrounds = $('tr')
.map(rowToObject)
.filter(row => row.address);

console.log(JSON.stringify(playgrounds));
function rowToObject(node) {
    const tds = $('td', node);
    const tdCount = tds.length;
    const type = tdCount > 1
        ? 'playground'
        : 'district';

    if (type === 'playground') {
        let [, address, type] = tds;

        return {
            address: parseAddress(trim(address.textContent)),
            type: trim(type ? type.textContent : '')
        }
    }
    else {
        const [name] = tds;
        return {
            type,
            name: trim(name.textContent)
        };
    }
}

function parseAddress(address) {
    const longRegex = /^(.+?),\s?уч.+?\(.+?дома\s?(\d+)/i;
    const shortRegex = /^(.+?),(.+)$/;
    const longMatch = address.match(longRegex);
    const shortMatch = address.match(shortRegex);

    if (! longMatch && ! shortMatch) {
        return '';
    }

    const [, street, house] = longMatch ? longMatch : shortMatch;

    return trim(`${street}, ${house}`);
}

function groupByDistrict(districts, row) {
    const {type} = row;

    if (type === 'district') {

        return districts.concat([{
            name: row.name,
            playgrounds: []
        }]);
    }
    else {
        const lastIndex = districts.length - 1;
        const district = districts[lastIndex];

        return districts.slice(lastIndex).concat([Object.assign({}, district, {
            playgrounds: district.playgrounds.concat([row])
        })]);
    }
}

function $(query, parent = document.body) {
    return Array.prototype.slice.apply(
        parent.querySelectorAll(query)
    );
}

function trim(string) {
    return string.trim().replace(/\s+/g, ' ');
}