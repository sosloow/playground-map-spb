const GOOGLE_GEOCODING_KEY = 'AIzaSyB3wTVY88cUw0rjzVd8DcArMZe24C9ELgE';

function writeToOutput(string) {
    const textarea = document.querySelector('textarea#output');

    textarea.textContent = string;
}

async function returnGeocoded() {
    const {default: playgrounds} = await import('./playgrounds.js');

    const geocodeThrottled = throttlePromised(geocode);

    const updatedPlaygrounds = await Promise.all(playgrounds.map(async (playground) => {
        const coords = await geocodeThrottled(playground.address);

        return Object.assign({}, playground, {
            coords
        });
    }));

    writeToOutput(JSON.stringify(updatedPlaygrounds));
};

async function geocode(address) {
    const urlBase = 'https://maps.googleapis.com/maps/api/geocode/json';

    const url = new URL(urlBase);
    url.searchParams.append('key', GOOGLE_GEOCODING_KEY);
    url.searchParams.append('address', `Санкт-Петербург, ${address}`);

    const res = await (await fetch(url)).json();

    if (res.error_message) {
        throw new Error(res.error_message);
    }

    const [result] = res.results;

    if (! result || ! result.geometry) {
        return {
            lat: 0,
            lng: 0
        };
    }

    return result.geometry.location;
}

function throttlePromised(fn, interval = 500) {
    var i = -1;

    return function(...args) {
        i++;

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                fn(...args).then(resolve).catch(reject);
            }, i * interval);
        });
    };
}

returnGeocoded().catch(console.error);
