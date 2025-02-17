// Initialize the map
const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  preload: 2, // Preload extra tiles for smoother panning
  visible: true
});

const parcelsLayer = new ol.layer.Tile({
  source: new ol.source.TileArcGISRest({
      url: 'https://maps.nj.gov/arcgis/rest/services/Basemap/Parcels_NJ/MapServer',
      crossOrigin: 'anonymous'
  }),
  preload: 2,
  opacity: 0.8,
  visible: false
});

// Define colors for property classes
const colorMap = {
  'Vacant Land': 'rgba(200, 200, 200, 0.5)',
  'Residential': 'rgba(255, 0, 0, 0.5)',
  'Public School Property': 'rgba(0, 255, 0, 0.5)',
  'Public Property': 'rgba(0, 0, 255, 0.5)',
  'Other School Property': 'rgba(255, 255, 0, 5)',
  'Other Exempt Properties': 'rgba(255, 165, 0, 0.5)',
  'Industrial': 'rgba(128, 0, 128, 0.5)',
  'Commercial': 'rgba(0, 255, 255, 0.5)',
  'Class II Railroad Property': 'rgba(255, 0, 255, 0.5)',
  'Class I Railroad Property': 'rgba(128, 128, 0, 0.5)',
  'Church & Charitable Properties': 'rgba(0, 128, 128, 0.5)',
  'Cemeteries & Graveyards': 'rgba(128, 128, 128, 0.5)',
  'Apartment': 'rgba(0, 0, 128, 0.5)'
};

const Summit = {
  "R-45": "Single Family Residential",
  "R-25": "Single Family Residential",
  "R-15": "Single Family Residential",
  "R-10": "Single Family Residential",
  "R-6": "Single & Two Family Residential",
  "RAH-1": "Affordable Housing",
  "MF": "Multi-Family Residential",
  "MFT": "Multi-Family Tower Residential",
  "GW-1": "Gateway - 1",
  "GW-2": "Gateway - 2",
  "TH-1": "Town House - 1",
  "TH-2": "Town House - 2",
  "NB": "Neighborhood Business",
  "B-B": "Business - 1",
  "CRBD": "Central Retail Business District",
  "ORC": "Office Residential Character - 1",
  "ORC2": "Office Residential Character - 2",
  "RO60": "Research - Office",
  "PROD": "Planned Research Office Development",
  "PROD-2": "Planned Research Office Development - 2",
  "LI": "Light Industry",
  "PI": "Professional - Institutional",
  "PL": "Public Land",
  "G": "Golf"
};
// Define zoning categories with descriptions
const Maplewood = {
  "PS": "Parkside",
  "R-1-4": "Residential 1 Family 4,000 Sf",
  "R-1-5": "Residential 1 Family 5,000 Sf",
  "R-1-7": "Residential 1 Family 7,000 Sf",
  "R-2-4": "Residential 2 Family",
  "RGA": "Residential Garden Apartments",
  "NB": "Neighborhood Business",
  "RB": "Retail Business",
  "PRB": "Pedestrian Retail Business",
  "HB": "Highway Business",
  "DB": "Office Business",
  "CB": "Commercial Business",
  "RO": "Research Office",
  "SLI": "Special Light Industrial",
  "CCRC": "Continuing Care Retirement Community",
  "SA-1": "Redevelopment Area 1",
  "SA-2": "Redevelopment Area 2",
  "SA-3": "Redevelopment Area 3",
  "DR-R": "Dunnell Road Redevelopment",
  "PORA": "Post Office Redevelopment Area",
  "PSRA": "PSEG Redevelopment Area",
  "TTARA": "Tara Toomey's Automotive Redevelopment Area",
  "7PAW": "7 Parker Avenue West Redevelopment Area"
};
const Millburn = {
  "R-3": "Residential 29,000 Sq. Ft.",
  "R-4": "Residential 20,000 Sq. Ft.",
  "R-5": "Residential 14,500 Sq. Ft.",
  "R-6": "Residential 6,000 Sq. Ft.",
  "R-7": "Residential 4,000 Sq. Ft.",
  "R-8": "Residential Multi-Family",
  "R-O": "Residential Office",
  "RMF-AH": "Residential Multi-Family Affordable Housing",
  "C": "Conservation - Recreation",
  "CD": "Cultural District",
  "B-1": "Regional Business",
  "B-2": "Highway Business",
  "B-3": "Neighborhood Business",
  "B-4": "Central Business",
  "OR-1": "Office - Research",
  "OR-2": "Office - Research",
  "OR-3": "Office - Research",
  "CMO": "Commercial/Medical Office",
  "P": "Public",
  "CE": "Conservation - Educational - Cultural"
};

const Montclair = {
  "C-1": "Central Business-Center Area",
  "C-1": "Central Business-Community Area",
  "C-2": "General Business & Light Manufacturing",
  "C-3": "Central Business",
  "N-C": "Neighborhood Commercial",
  "OR-4": "Three-Story Apartment and Office Building",
  "OR-3": "Garden Apartment & Office Building",
  "R-4": "Three-Story Apartment",
  "R-3": "Garden Group",
  "R-2": "Two-Family",
  "R-1": "One-Family",
  "R-Oa": "One-Family",
  "R-O": "Mountainside",
  "R-A": "Redevelopment Area",
  "P": "Public"
};



// List of GeoJSON files
const geojsonFiles = [
  { name: 'Westfield', path: 'Geojson/westfield.geojson' },
  { name: 'Summit', path: 'Geojson/summiit.geojson' },
  { name: 'Montclair', path: 'Geojson/montaclair.geojson' },
  { name: 'Millburn', path: 'Geojson/millburn.geojson' },
  { name: 'Maplewood', path: 'Geojson/maplewood.geojson' },
  { name: 'Livingston', path: 'Geojson/livingston.geojson' }
];

// Create GeoJSON layers dynamically
const geojsonLayers = geojsonFiles.map(file => {
  const source = new ol.source.Vector({
      url: file.path,
      format: new ol.format.GeoJSON(),
      strategy: ol.loadingstrategy.bbox // Load only visible area for better performance
  });

  const layer = new ol.layer.Vector({
      source,
      style: function (feature, resolution) {
          const propertyClass = feature.get('property_class_code_name');
          const color = colorMap[propertyClass] || 'rgba(0, 0, 0, 0.5)';
          let text = resolution < 10 ? feature.get('property_location') || '' : '';

          return new ol.style.Style({
              fill: new ol.style.Fill({ color }),
              stroke: new ol.style.Stroke({ color: 'black', width: 1 }),
              text: new ol.style.Text({
                  text,
                  font: '12px Arial',
                  fill: new ol.style.Fill({ color: 'black' }),
                  stroke: new ol.style.Stroke({ color: 'white', width: 2 })
              })
          });
      },
      declutter: true,
      visible: false
  });
  return layer;
});

// Initialize the map
const map = new ol.Map({
  target: 'map',
  layers: [osmLayer, parcelsLayer, ...geojsonLayers],
  view: new ol.View({
      center: ol.proj.fromLonLat([-74.2612, 40.7455]),
      zoom: 11.5
  })
});

// Toggle layer visibility
function toggleLayer(layerIndex) {
  geojsonLayers.forEach((layer, index) => {
      layer.setVisible(index === layerIndex);
  });
  updateLegend(layerIndex);
}

// Update legend
function updateLegend(layerIndex) {
  const legend = document.getElementById('legend');
  legend.innerHTML = `<h4>Zone</h4>`;
  const layer = geojsonLayers[layerIndex];
  const uniqueZones = new Set();
  
  layer.getSource().forEachFeature(feature => {
      const zone = feature.get('zone');
      if (zone && Zone[zone]) {
          uniqueZones.add(`${zone} - ${Zone[zone]}`);
      }
  });
  
  uniqueZones.forEach(zoneInfo => {
      legend.innerHTML += `<div>${zoneInfo}</div>`;
  });
}
  
  // Handle feature clicks with debounce
// Create a modal container
const modal = document.createElement('div');
modal.id = 'featureModal';
modal.style.position = 'fixed';
modal.style.top = '50%';
modal.style.left = '50%';
modal.style.transform = 'translate(-50%, -50%)';
modal.style.backgroundColor = 'white';
modal.style.padding = '20px';
modal.style.border = '1px solid #ccc';
modal.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.2)';
modal.style.display = 'none';
modal.style.zIndex = '1000';
modal.style.maxWidth = '400px';
modal.style.textAlign = 'center';

// Close button
const closeButton = document.createElement('button');
closeButton.innerText = 'Close';
closeButton.style.marginTop = '10px';
closeButton.style.padding = '5px 10px';
closeButton.style.backgroundColor = '#007bff';
closeButton.style.color = 'white';
closeButton.style.border = 'none';
closeButton.style.cursor = 'pointer';
closeButton.onclick = function () {
  modal.style.display = 'none';
};

// Append close button to modal
document.body.appendChild(modal);

// Function to display feature details in the modal
function showFeatureInfo(props) {
  modal.innerHTML = `
    <h3 style="margin-bottom: 10px;">Property Details</h3>
    <table style="width: 100%; border-collapse: collapse; text-align: left;">
      <tr><th style="border: 1px solid #ddd; padding: 8px;">County District</th><td style="border: 1px solid #ddd; padding: 8px;">${props.county_district || 'N/A'}</td></tr>
      <tr><th style="border: 1px solid #ddd; padding: 8px;">Property Block ID</th><td style="border: 1px solid #ddd; padding: 8px;">${props.property_id_blk || 'N/A'}</td></tr>
      <tr><th style="border: 1px solid #ddd; padding: 8px;">Property Lot ID</th><td style="border: 1px solid #ddd; padding: 8px;">${props.property_id_lot || 'N/A'}</td></tr>
      <tr><th style="border: 1px solid #ddd; padding: 8px;">Property Class</th><td style="border: 1px solid #ddd; padding: 8px;">${props.property_class_code_name || 'N/A'}</td></tr>
      <tr><th style="border: 1px solid #ddd; padding: 8px;">Property Location</th><td style="border: 1px solid #ddd; padding: 8px;">${props.property_location || 'N/A'}</td></tr>
      <tr><th style="border: 1px solid #ddd; padding: 8px;">ZIP Code</th><td style="border: 1px solid #ddd; padding: 8px;">${props.zip_code || 'N/A'}</td></tr>
      <tr><th style="border: 1px solid #ddd; padding: 8px;">Calculated Acreage</th><td style="border: 1px solid #ddd; padding: 8px;">${props.calculated_acreage || 'N/A'}</td></tr>
      <tr><th style="border: 1px solid #ddd; padding: 8px;">Zone</th><td style="border: 1px solid #ddd; padding: 8px;">${props.Zone || 'N/A'}</td></tr>
    </table>
  `;
  modal.appendChild(closeButton);
  modal.style.display = 'block';
}

// Handle feature clicks with debounce to prevent rapid clicks
let lastClick = 0;
map.on('singleclick', function (evt) {
  const now = Date.now();
  if (now - lastClick < 300) return; // Prevent spam clicks
  lastClick = now;

  map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    showFeatureInfo(feature.getProperties());
  });
});


          // Populate legend dynamically
    const legendItems = document.getElementById('legend-items');
    const legendItem = document.createElement('div');
    Object.keys(colorMap).forEach(key => {
      const legendItem = document.createElement('div');
      legendItem.innerHTML = `<span style="display: inline-block; width: 20px; height: 20px; background: ${colorMap[key]}; margin-right: 5px;"></span>${key}`;
      legendItems.appendChild(legendItem);
    });
  
// Layer toggling UI
const toggleDiv = document.getElementById('geojsonLayerToggles');

geojsonLayers.forEach((layer, index) => {
    const toggleLabel = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    toggleLabel.appendChild(checkbox);
    toggleLabel.append(` ${geojsonFiles[index].name}`);
    toggleDiv.appendChild(toggleLabel);
    toggleDiv.appendChild(document.createElement('br')); // Ensures each item is on a new line
    ;

    checkbox.addEventListener('change', function () {
        layer.setVisible(this.checked);
        updateLegend();
        updateDropdowns();
    });

    // Initial population when layers load
    layer.getSource().once('featuresloadend', () => {
        updateDropdowns();
    });
});

// Function to update legend based on visible layers
function updateLegend() {
  legendItems.innerHTML = ''; // Clear legend before updating

  // Preserve Property Class legend with colors
  const propertyClassLegend = document.createElement('div');
  propertyClassLegend.innerHTML = `<h4>Property Classes</h4>`;
  Object.keys(colorMap).forEach(key => {
      propertyClassLegend.innerHTML += `<div style="display: flex; align-items: center;">
          <span style="width: 15px; height: 15px; background: ${colorMap[key]}; display: inline-block; margin-right: 5px;"></span>
          ${key}
      </div>`;
  });
  legendItems.appendChild(propertyClassLegend);

// Update Zones dynamically based on checked layers
geojsonLayers.forEach((layer, index) => {
    if (layer.getVisible()) {
        const { name } = geojsonFiles[index];
        const zoneData = name === 'Summit' ? Summit : name === 'Maplewood' ? Maplewood : name === 'Millburn' ? Millburn : name === 'Montclair' ? Montclair: null;

        if (zoneData) {
            const legendItem = document.createElement('div');
            legendItem.innerHTML = `<h4>${name} Zones</h4>`;

            Object.entries(zoneData).forEach(([key, value]) => {
                legendItem.innerHTML += `${key} - ${value}<br>`;
            });

            legendItems.appendChild(legendItem);
        }
    }
});

}

// Function to update dropdowns dynamically based on visible layers
function updateDropdowns() {
    const propertyClasses = new Set();
    const zones = new Set();
    let minAcreage = Infinity;
    let maxAcreage = -Infinity;

    // Clear existing dropdowns
    const propertyClassSelect = document.getElementById('propertyClass');
    const zoneSelect = document.getElementById('Zone');
    propertyClassSelect.innerHTML = '<option value="">Select Property Class</option>';
    zoneSelect.innerHTML = '<option value="">Select Zone</option>';

    geojsonLayers.forEach(layer => {
        if (layer.getVisible()) {
            const features = layer.getSource().getFeatures();

            features.forEach(feature => {
                const propertyClass = feature.get('property_class_code_name');
                const acreage = parseFloat(feature.get('calculated_acreage'));
                const zone = feature.get('Zone');

                if (propertyClass) propertyClasses.add(propertyClass);
                if (zone) zones.add(zone);
                if (!isNaN(acreage)) {
                    minAcreage = Math.min(minAcreage, acreage);
                    maxAcreage = Math.max(maxAcreage, acreage);
                }
            });
        }
    });

    // Populate Property Class dropdown
    propertyClasses.forEach(classCode => {
        const option = document.createElement('option');
        option.value = classCode;
        option.textContent = classCode;
        propertyClassSelect.appendChild(option);
    });

    // Populate Zone dropdown
    zones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone;
        option.textContent = zone;
        zoneSelect.appendChild(option);
    });

    // Set min/max acreage fields
    document.getElementById('minAcreage').value = isFinite(minAcreage) ? minAcreage : '';
    document.getElementById('maxAcreage').value = isFinite(maxAcreage) ? maxAcreage : '';
}

  
  // Base layer toggling
  document.getElementById('osmLayerToggle').addEventListener('change', function () {
    osmLayer.setVisible(this.checked);
  });
  document.getElementById('parcelsLayerToggle').addEventListener('change', function () {
    parcelsLayer.setVisible(this.checked);
  });
  
  // Apply filters to the map
function applyFilters() {
    const selectedClass = document.getElementById('propertyClass').value;
    const minAcreage = parseFloat(document.getElementById('minAcreage').value);
    const maxAcreage = parseFloat(document.getElementById('maxAcreage').value);
    const selectedZone = document.getElementById('Zone').value;
  
    geojsonLayers.forEach(layer => {
      const source = layer.getSource();
      source.forEachFeature(feature => {
        const propertyClass = feature.get('property_class_code_name');
        const acreage = parseFloat(feature.get('calculated_acreage'));
        const zone = feature.get('Zone');
  
        // Check if feature matches selected filters
        const matchesClass = !selectedClass || propertyClass === selectedClass;
        const matchesAcreage = !isNaN(acreage) && (isNaN(minAcreage) || acreage >= minAcreage) && (isNaN(maxAcreage) || acreage <= maxAcreage);
        const matchesZone = !selectedZone || zone === selectedZone;
  
        // Apply style only if feature meets all filter conditions
        feature.setStyle(matchesClass && matchesAcreage && matchesZone ? null : new ol.style.Style({}));
      });
    });
  }
  
  // Add event listener to filter button
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  

  
  