import mapboxgl from 'mapbox-gl';

// Mapping VLM_LAJI to icon names
const iconMapping = {
    0: 'Tuntematon',
    1: 'Ankkurikielto',
    2: 'pysakoimiskielto',
    3: 'Kiinnittymiskielto',
    4: 'Ohittamiskielto',
    5: 'Kohtaamiskielto',
    6: 'Aallokkokielto',
    7: 'Vesihiihtokielto',
    8: 'Purjelautailukielto',
    9: 'Moottorikulkukielto',
    10: 'Vesiskootterikielto',
    11: 'Nopeusrajoitus',
    12: 'Pysahtymismerkki',
    13: 'Varoitusmerkki',
    14: 'Aanimerkki',
    15: 'Alikulkukorkeus',
    16: 'Kulkusyvyys',
    17: 'Kulkuleveys',
    18: 'Virtaus',
    19: 'Vaylan_reuna',
    20: 'Uimapaikka',
    21: 'Vhf',
    22: 'Pysakoiminen_sallittu',
    23: 'Kiinnittyminen_sallittu',
    24: 'Ilmajohto',
    25: 'Puhelin',
    26: 'Lossi',
    27: 'Lautta',
    28: 'Mahdollisuus_vhf',
    29: 'Vesipiste',
    30: 'Kielto_paattyy',
    31: 'Kaapeli',
    32: 'Johto',
    33: 'Suuntamerkki_alempi',
    34: 'Suuntamerkki_ylempi'
};

// Mapping VLM_LAJI to descriptive names
const merkkiMapping = {
    0: 'Tuntematon',
    1: 'Ankkurin käyttökielto',
    2: 'Pysäköimiskielto',
    3: 'Kiinnittymiskielto',
    4: 'Ohittamiskielto',
    5: 'Kohtaamiskielto',
    6: 'Aallokon aiheuttamisen kielto',
    7: 'Vesihiihtokielto',
    8: 'Purjelautailukielto',
    9: 'Aluksen kulku moottorilla kielletty',
    10: 'Vesiskootterilla ajo kielletty',
    11: 'Nopeusrajoitus',
    12: 'Pysähtymismerkki',
    13: 'Yleinen varoitusmerkki',
    14: 'Annettava äänimerkki',
    15: 'Rajoitettu alikulkukorkeus',
    16: 'Rajoitettu kulkusyvyys',
    17: 'Rajoitettu kulkuleveys',
    18: 'Voimakas virtaus',
    19: 'Väylän reuna',
    20: 'Varoitus uimapaikasta',
    21: 'Otettava yhteys radiopuhelimella',
    22: 'Pysäköiminen sallittu',
    23: 'Kiinnittyminen sallittu',
    24: 'Ilmajohto',
    25: 'Puhelin',
    26: 'Lossiväylän risteäminen',
    27: 'Lauttaväylän risteäminen',
    28: 'Mahdollisuus radiopuhelinyhteyteen',
    29: 'Juomavesipiste',
    30: 'Rajoituksen päättyminen',
    31: 'Kaapelitaulu',
    32: 'Johtotaulu',
    33: 'Johdon suuntamerkki alempi',
    34: 'Johdon suuntamerkki ylempi'
};

export const loadVesiliikennemerkit = async (mapInstance) => {
    // Function to load images
    const loadImage = (url) => {
        return new Promise((resolve, reject) => {
            mapInstance.loadImage(url, (error, image) => {
                if (error) reject(error);
                else resolve(image);
            });
        });
    };

    // Load and add all images to the map
    for (const key of Object.keys(iconMapping)) {
        const iconName = iconMapping[key];
        const imageUrl = `${process.env.PUBLIC_URL}/src/icons/vesiliikennemerkit/${iconName}.png`;
        try {
            const image = await loadImage(imageUrl);
            mapInstance.addImage(`${iconName}.png`, image);
        } catch (error) {
            console.error(`Error loading image ${imageUrl}`, error);
        }
    }

    const iconNameExpression = ['match', ['get', 'vlm_laji']];

    for (const [key, value] of Object.entries(iconMapping)) {
        iconNameExpression.push(Number(key), `${value}.png`);
    }

    iconNameExpression.push('Tuntematon.png'); // Default icon

    mapInstance.addLayer({
        id: 'vesiliikennemerkit',
        type: 'symbol',
        source: {
            type: 'vector',
            url: 'mapbox://ottotuhkunen.bgrtmnsg'
        },
        'source-layer': 'vesiliikennemerkit-2lqxw4',
        layout: {
            'icon-image': iconNameExpression,
            'icon-size': 0.4,
            'icon-allow-overlap': false,
            'text-field': [
                'case',
                ['any',
                    ['==', ['get', 'vlm_laji'], 11],
                    ['==', ['get', 'vlm_laji'], 15],
                    ['==', ['get', 'vlm_laji'], 16],
                    ['==', ['get', 'vlm_laji'], 17]
                ],
                ['get', 'ra_arvo'],
                ''
            ],
            'text-font': ['Arial Unicode MS Bold'],
            'text-size': 10,
            'text-justify': 'center',
            'text-anchor': 'center',
            'text-allow-overlap': false,
            visibility: 'none'
        },
        paint: {
            'text-color': 'black'
        },
        minzoom: 8
    });

    // Add popups on click
    mapInstance.on('click', 'vesiliikennemerkit', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const props = e.features[0].properties;

        // kieltomerkin tyyppi
        let description = `<h2>${merkkiMapping[props.vlm_laji] || 'Tuntematon'}</h2>`;

        // rajoituksen arvo (esim. km/h)
        if (props.ra_arvo_t) {
            if (props.vlm_laji === 11) description += `<h3>${props.ra_arvo_t} km/h</h3>`;
            else description += `<h3>${props.ra_arvo_t}</h3>`;
        }

        // lisäkilven teksti ja lisätiedot
        if (props.lk_tekstis) description += `<p>➕ ${props.lk_tekstis}</p>`;
        if (props.lisatietos) description += `<p><strong>Lisätieto: </strong>${props.lisatietos}</p>`;

        // sijainti
        if (props.sijaintis) description += `<p>📍 <em>${props.sijaintis}</em></p>`;

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(mapInstance);
    });

    // Change the cursor to a pointer when the mouse is over the icons
    mapInstance.on('mouseenter', 'vesiliikennemerkit', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves
    mapInstance.on('mouseleave', 'vesiliikennemerkit', () => {
        mapInstance.getCanvas().style.cursor = '';
    });
};
