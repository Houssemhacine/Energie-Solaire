let pointURL, ecartURL;
let pointData, ecartData, allMonths = [];
let validationOriginalData, validationTransmitanceData;
let map;
const markerLayer = L.layerGroup();
let datasetName = "SWGDN";
let currentMode = "";
let previsionStep = 0;



// Initialisation du mode (Analyse ou Validation)
function selectMode() {
  const mode = document.getElementById("mode-select").value;
  currentMode = mode;

  document.getElementById("mode-panel").style.display = "none";
  document.getElementById("reload-button").style.display = "block";
  document.getElementById("back-button").style.display = "none";
  document.getElementById("map").style.display = "block";

  if (mode === "analysis") {
    document.getElementById("dataset-panel").style.display = "block";
  } else if (mode === "validation") {
    document.getElementById("validation-type-panel").style.display = "block";
  }else if (mode === "prevision") {
    document.getElementById("method-panel").style.display = "block";
    previsionStep = 1;
}
}

function selectValidationType() {
  const validationType = document.getElementById("validation-type-select").value;
  document.getElementById("validation-type-panel").style.display = "none";
  document.getElementById("mode-panel").style.display = "none";
  document.getElementById("validation-control-panel").style.display = "block";
  document.getElementById("back-button").style.display = "inline-block";
  setupValidationMonths();
  
  if (!map) {
    map = L.map('map').setView([28, 2], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    markerLayer.addTo(map);
  }
  
  loadValidationData([]); 
}
// Sélectionner tous les mois
function selectAllMonths() {
  const select = document.getElementById('validation-month-select');
  const options = select.options;
  
  for (let i = 0; i < options.length; i++) {
    options[i].selected = true;
  }

  if (map) {
    const selectedMonths = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    const selectedClusters = Array.from(document.getElementById('validation-cluster-filter').selectedOptions)
      .map(option => option.value);
    
    loadValidationData(selectedMonths, selectedClusters);
  }
}

function goBack() {
  document.getElementById("map").innerHTML = ""; 
  if (map) {
    map.remove(); 
    map = null;   
  }

  markerLayer.clearLayers();

  // Masquer tous les panneaux
  document.getElementById("mode-panel").style.display = "none";
  document.getElementById("dataset-panel").style.display = "none";
  document.getElementById("method-panel").style.display = "none";
  document.getElementById("prevision-dataset-panel").style.display = "none";
  document.getElementById("mode-M").style.display = "none";
  document.getElementById("control-panel").style.display = "none";
  document.getElementById("validation-type-panel").style.display = "none";
  document.getElementById("validation-control-panel").style.display = "none";

  const mode = document.getElementById("mode-select").value;

  if (mode === "analysis") {
    document.getElementById("mode-panel").style.display = "none";
    document.getElementById("back-button").style.display = "none";
    document.getElementById("dataset-panel").style.display = "block";
  } else if (mode === "validation") {
    document.getElementById("mode-panel").style.display = "none";
    document.getElementById("back-button").style.display = "none";
    document.getElementById("validation-type-panel").style.display = "block";
  } else if (mode === "prevision") {
    
    if (previsionStep === 4) {
      document.getElementById("mode-M").style.display = "block";
      document.getElementById("back-button").style.display = "inline-block";
      previsionStep = 3;
    }else if (previsionStep === 3) {
      document.getElementById("mode-M").style.display = "block";
      document.getElementById("back-button").style.display = "inline-block";
      previsionStep = 2;
       
    } else if (previsionStep === 2) {
      document.getElementById("prevision-dataset-panel").style.display = "block";
      document.getElementById("back-button").style.display = "inline-block";
      previsionStep = 1;
      
    } else if (previsionStep === 1) {
      document.getElementById("prevision-dataset-panel").style.display = "block";
      document.getElementById("back-button").style.display = "inline-block";
      previsionStep = 0;
    } else {
      document.getElementById("method-panel").style.display = "block";
      document.getElementById("back-button").style.display = "none";
    }
  }
}


// Désélectionner tous les mois
function deselectAllMonths() {
  const select = document.getElementById('validation-month-select');
  const options = select.options;
  
  for (let i = 0; i < options.length; i++) {
    options[i].selected = false;
  }

  if (map) {
    const selectedMonths = [];                     
    const selectedClusters = Array.from(document.getElementById('validation-cluster-filter').selectedOptions)
      .map(option => option.value);
    
    loadValidationData(selectedMonths, selectedClusters);
  }
}




function selectMethod() {
  const method = document.getElementById('method-select').value;
  previsionStep = 2;
  document.getElementById("method-panel").style.display = "none";
  document.getElementById("prevision-dataset-panel").style.display = "block";
  document.getElementById("back-button").style.display = "inline-block";
}

function selectPrevisionDataset() {
  const dataset = document.getElementById('prevision-dataset-select').value;
  const method = document.getElementById('method-select').value;

  window.selectedMethod = method;
  window.selectedDataset = dataset.toUpperCase(); 

  const displayModeSelect = document.getElementById('mode-M-select');
  const dailyOption = Array.from(displayModeSelect.options).find(opt => opt.value === 'daily');

  if (method === 'SARIMAX') {
    if (dailyOption) dailyOption.style.display = 'none';
    if (displayModeSelect.value === 'daily') {
      displayModeSelect.value = 'monthly';
    }
  } else {
    if (dailyOption) dailyOption.style.display = 'block';
  }

  document.getElementById("prevision-dataset-panel").style.display = "none";
  document.getElementById("mode-M").style.display = "block";
  document.getElementById("back-button").style.display = "inline-block";
}



function loadMapBasedOnSelection() {
  const mode = document.getElementById('mode-M-select').value;
  const selectedYear = document.getElementById('year-selection').value;
  previsionStep = 4;
  document.getElementById('mode-M').style.display = 'none';
  document.getElementById("back-button").style.display = "inline-block";

  // Initialisation de la carte si non encore créée
  if (!map) {
    map = L.map('map').setView([28, 2], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    markerLayer.addTo(map);
  }

  // Construction du nom de fichier à charger
  const filename = `${window.selectedMethod.toLowerCase()}_${window.selectedDataset.toUpperCase()}_${mode.toLowerCase()}.json`;

  // Chargement des données
  fetch(filename)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (data && Object.keys(data).length > 0) {
        markerLayer.clearLayers();
        displayPrevisionDataOnMap(data, mode, selectedYear);
      }
    })
    .catch(error => {
      console.error('Erreur lors du chargement des données :', error);
    });
}

function displayPrevisionDataOnMap(data, mode, selectedYear) {
  markerLayer.clearLayers();

  Object.entries(data).forEach(([key, point]) => {
    // Vérification des coordonnées valides
    const lat = parseFloat(point.lat);
    let lon = parseFloat(point.lon);
    if (lon === -0 || lon === -0.0) lon = 0; 

    if (!isFinite(lat) || !isFinite(lon) || !point.values) return;

    // Extraction du nom de la ville depuis la clé
    const parts = key.split('_'); 
    if (parts.length >= 3) {
      const idAndName = parts[0]; 
      const namePart = idAndName.substring(idAndName.indexOf('-') + 1);
      var name = namePart.replace(/-/g, ' ');
    } else {
          var name = `Point ${point.ID || 'N/A'}`;
       }

    // Filtrage des valeurs selon l'année
    const entries = selectedYear === "all"
      ? Object.entries(point.values)
      : Object.entries(point.values).filter(([date, _]) => date.startsWith(selectedYear));
    const months = entries.map(([date, _]) => date);
    const values = entries.map(([_, value]) => value);

    // Création du marqueur bleu
    const marker = L.circleMarker([lat, lon], {
      radius: 8,
      fillColor: 'blue', 
      color: '#000',
      weight: 1,
      fillOpacity: 0.8
    }).addTo(markerLayer);

    // ID unique pour le graphique
    const chartId = `chart-${point.ID}-${lat}-${lon}`
      .replace(/\./g, '-')
      .replace(/\s+/g, '-');

    // Contenu de la popup
    const popupContent = `
      <h4>Ville : ${name}</h4>
      <b>ID:</b> ${point.ID || 'N/A'}<br>
      <p><strong>Latitude:</strong> ${lat}</p>
      <p><strong>Longitude:</strong> ${lon}</p>
      <strong>${selectedYear === 'all' ? 'Toutes les années' : 'Année'}:</strong> ${selectedYear}<br>
      <div id="${chartId}" style="width:700px;height:350px;margin-top:10px;"></div>
    `;

    marker.bindPopup(popupContent);

    // Affichage du graphique lors de l'ouverture de la popup
    marker.on('popupopen', () => {
      setTimeout(() => {
        const trace = {
          x: months,
          y: values,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Valeurs',
          marker: { color: 'blue' }
        };

        const layout = {
          title: `${point.ID || 'N/A'} - ${name}`,
          xaxis: { title: 'Date' },
          yaxis: { title: 'Valeur', rangemode: 'tozero' },
          margin: { t: 50 }
        };

        Plotly.newPlot(chartId, [trace], layout, { displayModeBar: false });
      }, 100);
    });
  });

  // Ajustement du zoom pour afficher tous les points
  if (Object.keys(data).length > 0) {
    map.fitBounds(markerLayer.getBounds());
  }
}





















// Initialisation de la carte pour l'analyse
function initMap() {
  const ds = document.getElementById('dataset-select').value;
  datasetName = ds.toUpperCase();
  document.title = "Carte Interactive " + datasetName;

  if (ds === 'swgdn') {
    pointURL = 'point_meanmois_SWGDN_data_classified.json';
    ecartURL = 'point_ecrtmois_SWGDN_data_classified.json';
  } else if (ds === 'swgdnclr') {
    pointURL = 'point_meanmois_SWGDNCLR_data_classified.json';
    ecartURL = 'point_ecrtmois_SWGDNCLR_data_classified.json';
  } else if (ds === 'swgnt') {
    pointURL = 'point_meanmois_SWGNT_data_classified.json';
    ecartURL = 'point_ecrtmois_SWGNT_data_classified.json';
  }

  document.getElementById('mode-panel').style.display = 'none';
  document.getElementById('dataset-panel').style.display = 'none';
  document.getElementById('control-panel').style.display = 'block';
  document.getElementById('reload-button').style.display = 'block';
  document.getElementById("back-button").style.display = "inline-block"; 

  if (!map) {
    map = L.map('map').setView([28, 2], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    addDatasetLegend();
  }
  markerLayer.addTo(map);
  loadData();
}

function addDatasetLegend() {
  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');
    div.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    div.style.padding = '10px';
    div.style.borderRadius = '5px';
    div.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    div.style.maxHeight = '300px';
    div.style.overflowY = 'auto';
    
    const toggleButton = L.DomUtil.create('button', 'legend-toggle', div);
    toggleButton.innerHTML = '▲';
    toggleButton.style.position = 'absolute';
    toggleButton.style.right = '5px';
    toggleButton.style.top = '5px';
    toggleButton.style.background = 'none';
    toggleButton.style.border = 'none';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.fontSize = '12px';
    
    let legendContent = '<h4 style="margin:5px 0 10px 0; text-align:center;">Clusters</h4>';
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080', 
                   '#A52A2A', '#00FFFF', '#FF00FF', '#808080', '#FFC0CB'];
    
    for (let i = 1; i <= 10; i++) {
      legendContent += `
        <div style="margin:3px 0; display:flex; align-items:center;">
          <i style="background:${colors[i-1]}; width:15px; height:15px; display:inline-block; border:1px solid #ccc;"></i>
          <span style="margin-left:5px;">Cluster ${i}</span>
        </div>
      `;
    }
    
    const contentDiv = L.DomUtil.create('div', 'legend-content', div);
    contentDiv.innerHTML = legendContent;
    
    let isCollapsed = false;
    toggleButton.addEventListener('click', function() {
      isCollapsed = !isCollapsed;
      if (isCollapsed) {
        contentDiv.style.display = 'none';
        toggleButton.innerHTML = '▼';
        div.style.height = '30px';
      } else {
        contentDiv.style.display = 'block';
        toggleButton.innerHTML = '▲';
        div.style.height = 'auto';
      }
      map.invalidateSize();
    });
    
    if (window.innerWidth < 768) {
      toggleButton.click();
    }
    
    return div;
  };

  legend.addTo(map);
}


// Initialisation similaire à l'analyse
function initValidationMode() {
  
  document.getElementById("validation-control-panel").style.display = "block";
  setupValidationMonths(); // Remplir les mois dynamiquement
}

// Remplir les mois 
function setupValidationMonths() {
  const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
               'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const select = document.getElementById('validation-month-select');
  select.innerHTML = '';
  mois.forEach((m, i) => {
    select.add(new Option(m, i+1));
  });
  
  Array.from(select.options).forEach(option => {
    option.selected = true;
  });
  
  select.addEventListener('change', function() {
    const selectedMonths = Array.from(this.selectedOptions).map(o => o.value);
    const selectedClusters = Array.from(
      document.getElementById('validation-cluster-filter').selectedOptions
    ).map(o => o.value);
    
    loadValidationData(selectedMonths, selectedClusters);
  });
}
// Initialisation de la carte pour la validation
function initValidationMap() {
  if (!map) {
    map = L.map('map').setView([28, 2], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    markerLayer.addTo(map);
  }
  
  const selectedMonths = Array.from(
    document.getElementById('validation-month-select').selectedOptions
  ).map(o => o.value);
  
  if (selectedMonths.length > 0) {
    loadValidationData(selectedMonths);
  }
}

// Chargement des données pour la validation
function loadValidationData(selectedMonths, selectedClusters = ['all']) {
  const validationType = document.getElementById("validation-type-select").value;
  
  Promise.all([
    fetch('2008-mois.json').then(r => r.json()),
    fetch('transmitance-mois.json').then(r => r.json())
  ]).then(([originalData, transmitanceData]) => {
    validationOriginalData = originalData;
    validationTransmitanceData = transmitanceData;
    
    if (validationType === 'estimation') {
      const regressionResults = calculateRegressionByCluster(originalData, transmitanceData);
      processEstimationData(selectedMonths, selectedClusters, regressionResults);
    } else {
      processValidationData(selectedMonths, selectedClusters);
    }
    
    addLegend();
  }).catch(error => {
    console.error('Erreur de chargement des données:', error);
  });
}

function processEstimationData(selectedMonths, selectedClusters = ['all'], regressionResults) {
  markerLayer.clearLayers();
  let validPointsCount = 0;
  
  const numericClusters = selectedClusters.includes('all') 
    ? Object.keys(regressionResults).map(Number)
    : selectedClusters.map(Number).filter(n => !isNaN(n));
  
  console.log("Coefficients de régression par cluster:");
  for (const cluster in regressionResults) {
    const { a, b, r2 } = regressionResults[cluster];
    console.log(`Cluster ${cluster}: a=${a.toFixed(4)}, b=${b.toFixed(4)}, R²=${r2.toFixed(4)}`);
  }
  
  for (const key in validationTransmitanceData) {
    const transPoint = validationTransmitanceData[key];
    const cluster = transPoint.cluster;
    
    if (!numericClusters.includes(cluster) || !regressionResults[cluster]) continue;
    
    const { a, b, r2 } = regressionResults[cluster];
    const monthsWithData = [];
    const estimatedValues = [];
    const transmitanceValues = [];
    const errors = [];
    let hasOriginalData = false;
    
    const originalPointKey = Object.keys(validationOriginalData).find(
      k => validationOriginalData[k].ID === transPoint.ID
    );
    const originalPoint = validationOriginalData[originalPointKey];
    hasOriginalData = originalPoint && selectedMonths.some(month => 
      originalPoint.values[month] !== undefined
    );
    
    selectedMonths.forEach(month => {
      const transVal = transPoint.values[month];
      if (transVal !== undefined) {
        const estimatedVal = (transVal - b) / a;
        
        monthsWithData.push(month);
        transmitanceValues.push(transVal);
        estimatedValues.push(estimatedVal);
        errors.push(Math.abs(transVal - estimatedVal));
      }
    });
    
    if (monthsWithData.length > 0) {
      const avgError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
      
      const color = hasOriginalData ? '#2ca02c' : '#1f77b4'; 
      const pointType = hasOriginalData ? '(insolation)' : '(Estimée)';
      
      const chartId = `chart-${transPoint.ID}-${transPoint.lat}-${transPoint.lon}`
        .replace(/\./g, '-')
        .replace(/\s+/g, '-');
      
      let popupContent = `
        <div class="popup-header">
          <h4>Ville: <span style="color:#007bff">${transPoint.ID}</span> ${pointType}</h4>
          <p><strong>Coordonnées:</strong> ${transPoint.lat.toFixed(4)}, ${transPoint.lon.toFixed(4)}</p>
          <p><strong>Cluster:</strong> ${cluster}</p>
          <p><strong>R² du cluster:</strong> ${r2.toFixed(4)}</p>
          <p><strong>Équation:</strong> T% = ${a.toFixed(4)}(S/S0) + ${b.toFixed(4)}</p>
        </div>
        <div class="error-summary">
          <p class="avg-error">Erreur moyenne: <strong>${avgError.toFixed(2)}%</strong></p>
        </div>
        <div id="${chartId}" class="chart-container"></div>
      `;
      
      const marker = L.circleMarker([transPoint.lat, transPoint.lon], {
        radius: 8 + (avgError / 10),
        fillColor: color,
        color: '#333',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
      
      marker.addTo(markerLayer).bindPopup(popupContent);
      
      marker.on('popupopen', () => {
        setTimeout(() => {
          const traces = [];
          
          traces.push({
            x: monthsWithData,
            y: transmitanceValues,
            name: 'Transmitance',
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#2ca02c', width: 2, dash: 'dot' },
            marker: { size: 8 }
          });
          
          traces.push({
            x: monthsWithData,
            y: estimatedValues,
            name: 'Estimé',
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#1f77b4', width: 2 },
            marker: { size: 8 }
          });
          
          if (hasOriginalData) {
            const originalValues = selectedMonths.map(month => 
              originalPoint.values[month]
            ).filter(v => v !== undefined);
            
            traces.push({
              x: monthsWithData,
              y: originalValues,
              name: 'Insolation',
              type: 'scatter',
              mode: 'lines+markers',
              line: { color: '#d62728', width: 2 },
              marker: { size: 8 }
            });
          }
          
          traces.push({
            x: monthsWithData,
            y: errors,
            name: 'Erreur absolue',
            type: 'bar',
            yaxis: 'y2',
            marker: { color: 'rgba(255, 99, 71, 0.6)' }
          });
          
          const layout = {
            title: `Comparaison des valeurs ${hasOriginalData ? 'insolation et estimées' : 'estimées'}`,
            xaxis: { title: 'Mois' },
            yaxis: { 
              title: 'Valeurs',
              range: [0, Math.max(...transmitanceValues, ...estimatedValues) * 1.1]
            },
            yaxis2: {
              title: 'Erreur',
              overlaying: 'y',
              side: 'right',
              range: [0, Math.max(...errors) * 1.1]
            },
            margin: { t: 70, l: 50, r: 50, b: 40 },
            legend: { orientation: 'h', y: 1.1 }
          };
          
          Plotly.newPlot(chartId, traces, layout, {
            displayModeBar: false,
            responsive: true
          });
        }, 100);
      });
      
      validPointsCount++;
    }
  }
  
  if (validPointsCount > 0 && markerLayer.getLayers().length > 0) {
    map.fitBounds(markerLayer.getBounds());
  } 
}

function addLegend() {
  const oldLegend = document.querySelector('.info.legend');
  if (oldLegend) oldLegend.remove();

  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');
    div.style.backgroundColor = 'white';
    div.style.padding = '10px';
    div.style.borderRadius = '5px';
    div.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
    
    const validationType = document.getElementById('validation-type-select').value;
    
    if (validationType === 'estimation') {
      div.innerHTML = `
        <h4 style="margin:0 0 5px 0;">Légende</h4>
        <div><i style="background:#2ca02c; width:15px; height:15px; display:inline-block;"></i> Données insolations</div>
        <div><i style="background:#1f77b4; width:15px; height:15px; display:inline-block;"></i> Données estimées</div>
      `;
    } else {
      div.innerHTML = `
        <h4 style="margin:0 0 5px 0;">Légende</h4>
        <div><i style="background:#2ca02c; width:15px; height:15px; display:inline-block;"></i> Points de validation</div>
        <div><i style="background:#ff0000; width:15px; height:15px; display:inline-block;"></i> Erreurs élevées</div>
      `;
    }
    
    return div;
  };

  legend.addTo(map);
}

// Traitement des données de validation

function processValidationData(selectedMonths, selectedClusters = ['all']) {
  // Vider la couche des marqueurs existants
  markerLayer.clearLayers();
  let validPointsCount = 0;

  // Convertir les clusters sélectionnés en nombres (car dans les données c'est numérique)
  const numericClusters = selectedClusters.includes('all') 
    ? [] 
    : selectedClusters.map(Number).filter(n => !isNaN(n));

  // Parcourir tous les points de données de transmitance
  for (const key in validationTransmitanceData) {
    const transPoint = validationTransmitanceData[key];
    
    // Trouver le point original correspondant dans les données de 2008
    const originalPointKey = Object.keys(validationOriginalData).find(
      k => validationOriginalData[k].ID === transPoint.ID
    );
    const originalPoint = validationOriginalData[originalPointKey];

    // Si point original non trouvé, passer au suivant
    if (!originalPoint) {
      console.warn(`Point original non trouvé pour ID: ${transPoint.ID}`);
      continue;
    }

    // Appliquer le filtre par cluster si nécessaire
    if (numericClusters.length > 0) {
      // Vérifier si le point a un cluster et s'il correspond aux sélections
      if (typeof transPoint.cluster === 'undefined' || !numericClusters.includes(transPoint.cluster)) {
        continue; // Passer ce point si le cluster ne correspond pas
      }
    }

    // Préparer les tableaux pour les données mensuelles
    const monthsWithData = [];
    const originalValues = [];
    const transmitanceValues = [];
    const errors = [];
    let totalError = 0;
    let errorCount = 0;

    // Calculer les erreurs pour chaque mois sélectionné
    selectedMonths.forEach(month => {
      const originalVal = originalPoint.values[month];
      const transVal = transPoint.values[month];
      
      if (originalVal !== undefined && transVal !== undefined) {
        const error = Math.abs(originalVal - transVal);
        const errorPercentage = (error / originalVal) * 100;
        
        monthsWithData.push(month);
        originalValues.push(originalVal);
        transmitanceValues.push(transVal);
        errors.push(error);
        
        totalError += errorPercentage;
        errorCount++;
      }
    });

    // Si on a des données valides pour ce point
    if (errorCount > 0) {
      const avgError = totalError / errorCount;
      const color = getColorForError(avgError);
      
      // Créer un ID unique pour le graphique
      const chartId = `chart-${transPoint.ID}-${transPoint.lat}-${transPoint.lon}`
        .replace(/\./g, '-')
        .replace(/\s+/g, '-');

      // Contenu HTML pour le popup
      let popupContent = `
        <div class="popup-header">
          <h4>Ville: <span style="color:#007bff">${originalPointKey}</span></h4>
          <p><strong>Coordonnées:</strong> ${transPoint.lat.toFixed(4)}, ${transPoint.lon.toFixed(4)}</p>
          <p><strong>Cluster:</strong> ${transPoint.cluster}</p>
        </div>
        <div class="error-summary">
          <p class="avg-error">Erreur moyenne: <strong>${avgError.toFixed(2)}%</strong></p>
        </div>
        <div id="${chartId}" class="chart-container"></div>
      `;

      // Créer le marqueur
      const marker = L.circleMarker([transPoint.lat, transPoint.lon], {
        radius: 8 + (avgError / 10), // Taille proportionnelle à l'erreur
        fillColor: color,
        color: '#333',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });

      // Ajouter le marqueur avec son popup
      marker.addTo(markerLayer).bindPopup(popupContent);

      // Gérer l'ouverture du popup
      marker.on('popupopen', () => {
        setTimeout(() => {
          try {
            // Créer le graphique avec Plotly
            const traceOriginal = {
              x: monthsWithData,
              y: originalValues,
              name: 'Insolation',
              type: 'scatter',
              mode: 'lines+markers',
              line: { color: '#1f77b4', width: 2 },
              marker: { size: 8 }
            };

            const traceTransmitance = {
              x: monthsWithData,
              y: transmitanceValues,
              name: 'Transmitance',
              type: 'scatter',
              mode: 'lines+markers',
              line: { color: '#2ca02c', width: 2, dash: 'dot' },
              marker: { size: 8 }
            };

            const traceError = {
              x: monthsWithData,
              y: errors,
              name: 'Erreur absolue',
              type: 'bar',
              yaxis: 'y2',
              marker: { color: 'rgba(255, 99, 71, 0.6)' }
            };

            // Configuration du graphique
            const layout = {
              title: `Comparaison des valeurs`,
              xaxis: { title: 'Mois' },
              yaxis: { 
                title: 'Valeurs',
                range: [0, Math.max(...originalValues, ...transmitanceValues) * 1.1]
              },
              yaxis2: {
                title: 'Erreur',
                overlaying: 'y',
                side: 'right',
                range: [0, Math.max(...errors) * 1.1]
              },
              margin: { t: 70, l: 50, r: 50, b: 40 },
              legend: { orientation: 'h', y: 1.1 }
            };

            Plotly.newPlot(chartId, [traceOriginal, traceTransmitance, traceError], layout, {
              displayModeBar: false,
              responsive: true
            });
          } catch (error) {
            console.error("Erreur création graphique:", error);
          }
        }, 100);
      });

      validPointsCount++;
    }
  }

  // Ajuster la vue de la carte si on a des points valides
  if (validPointsCount > 0) {
    if (markerLayer.getLayers().length > 0) {
      map.fitBounds(markerLayer.getBounds());
    }
  } 
  
}
// Fonction pour obtenir une couleur en fonction de l'erreur
function getColorForError(errorPercentage) {
  // On veut que les erreurs de 0% à 10% déterminent la couleur
  const minError = 10;
  const maxError = 41;

  // Normalisation dans l'intervalle [0,1]
  let normalized = (errorPercentage - minError) / (maxError - minError);

  // Clamp la valeur entre 0 et 1
  normalized = Math.max(0, Math.min(1, normalized));

  // Calcul de la teinte HSL : 120 (vert) à 0 (rouge)
  const hue = (1 - normalized) * 120;
  return `hsl(${hue}, 100%, 50%)`;
}




// Charger les fichiers JSON (mode Analyse)
function loadData() {
  Promise.all([
    fetch(pointURL).then(r => r.json()),
    fetch(ecartURL).then(r => r.json())
  ]).then(([pd, ed]) => {
    pointData = pd;
    ecartData = ed;
    prepareMonths();
    handleModeChange();
  }).catch(error => console.error('Erreur de chargement des données:', error));
}


// Extraire les mois disponibles (mode Analyse)
function prepareMonths() {
  const ms = new Set();
  for (const pt in pointData) Object.keys(pointData[pt].values).forEach(m => ms.add(m));
  allMonths = Array.from(ms).map(m => Number(m)).sort((a, b) => a - b);

  const sel = id => document.getElementById(id);
  sel('months-select').innerHTML = '';
  sel('one-month-select').innerHTML = '';

  allMonths.forEach(m => {
    sel('months-select').add(new Option(getMonthName(m), m));
    sel('one-month-select').add(new Option(getMonthName(m), m));
  });

  ['mode', 'months-select', 'one-month-select', 'cluster-filter']
    .forEach(id => sel(id).addEventListener('change', handleModeChange));
}

function getMonthName(m) {
  const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return mois[Number(m) - 1] || m;
}

// Gérer l'affichage des mois (mode Analyse)
function handleModeChange() {
  const m = document.getElementById('mode').value;
  document.getElementById('select-months-container').style.display = (m === 'select_months') ? 'block' : 'none';
  document.getElementById('one-month-container').style.display = (m === 'one_month') ? 'block' : 'none';
  updateMap();
}

// Mettre à jour la carte avec les points (mode Analyse)
function updateMap() {
  markerLayer.clearLayers();
  const mode = document.getElementById('mode').value;
  const months = (mode === 'select_months')
    ? Array.from(document.getElementById('months-select').selectedOptions).map(o => o.value)
    : (mode === 'one_month') ? [document.getElementById('one-month-select').value] : allMonths;

  const clusters = Array.from(document.getElementById('cluster-filter').selectedOptions).map(o => o.value);

  for (const pt in pointData) {
    const p = pointData[pt];
    if (clusters.length && !clusters.includes('all') && !clusters.includes(String(p.cluster))) continue;
    const vals = months.map(m => p.values[m]).filter(v => v !== undefined);
    if (!vals.length) continue;
    
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = (sum / vals.length).toFixed(2);
    
    const ecarts = months.map(m => ecartData[pt]?.values[m] ?? null);
    let popup = `
      <b>${pt}</b>
      <p style="margin: 4px 0;"><strong>Cluster:</strong> ${p.cluster}</p>
      <p style="margin: 4px 0;"><strong>Moyenne (${months.length} mois):</strong> ${avg}</p>
    `;
    
    const marker = L.circleMarker([p.lat, p.lon], {
      radius: 8,
      fillColor: getColorForCluster(p.cluster),
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(markerLayer);
    
    const divId = `plot-${pt}`;
    popup += `<div id="${divId}" style="width:700px;height:350px;"></div>`;
    marker.bindPopup(popup);
    
    if (mode !== 'one_month') marker.on('popupopen', () => plotPopup(divId, months, vals, ecarts, pt));
  }
}

// Tracer les graphiques dans les popups (mode Analyse)
function plotPopup(divId, months, vals, ecarts, pt) {
  const xNum = months.map(m => Number(m));
  const traceSW = { x: xNum, y: vals, mode: 'lines+markers', type: 'scatter', name: datasetName, marker: { color: 'blue' } };
  const traceEC = { x: xNum, y: ecarts, mode: 'lines+markers', type: 'scatter', name: 'Écart-type', line: { dash: 'dot', color: 'black' }, marker: { symbol: 'circle-open', size: 8, color: 'black' }, error_y: { type: 'data', array: ecarts, visible: true } };
  Plotly.newPlot(divId, [traceSW, traceEC], {
    margin: { t: 100 },
    title: `${pt} — ${datasetName}`,
    xaxis: { title: 'Mois', tickvals: xNum, ticktext: months, tickmode: 'array' },
    yaxis: { title: 'Valeurs', rangemode: 'tozero' },
    showlegend: true
  });
}

// Analyse d'un seul mois en histogramme (mode Analyse)
function analyzeSingleMonth() {
  const sm = document.getElementById('one-month-select').value;
  const clusters = Array.from(document.getElementById('cluster-filter').selectedOptions).map(o => o.value);
  const x = [], ySW = [], yEC = [];
  for (const pt in pointData) {
    const p = pointData[pt];
    if (clusters.length && !clusters.includes('all') && !clusters.includes(String(p.cluster))) continue;
    const v = p.values[sm];
    if (v != null) {
      x.push(pt);
      ySW.push(v);
      yEC.push(ecartData[pt]?.values[sm] ?? null);
    }
  }
  const div = document.createElement('div');
  Object.assign(div.style, {
    position: 'fixed', top: '50px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 2000, background: 'white', padding: '20px',
    border: '1px solid #ccc', borderRadius: '8px'
  });
  const btn = document.createElement('button'); btn.textContent = 'Fermer'; btn.onclick = () => div.remove();btn.style.width = '00px'
  const pd = document.createElement('div'); pd.style.width = '600px'; pd.style.height = '400px';
  div.append(btn, pd);
  document.body.append(div);
  Plotly.newPlot(pd, [
    { x, y: ySW, type: 'bar', name: datasetName, marker: { color: 'blue' } },
    { x, y: yEC, type: 'bar', name: 'Écart-type', marker: { color: 'black' } }
  ], {
    barmode: 'group',
    title: `Analyse du mois ${sm}`,
    xaxis: { title: 'Points' },
    yaxis: { title: 'Valeurs' }
  });
}

// Déterminer la couleur par cluster (mode Analyse)
function getColorForCluster(cluster) {
  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080',
    '#A52A2A', '#00FFFF', '#FF00FF', '#808080', '#FFC0CB'
  ];
  return colors[(cluster - 1) % colors.length];
}


document.getElementById('validation-month-select').addEventListener('change', function() {
  const selectedMonths = Array.from(this.selectedOptions).map(o => o.value);
  if (selectedMonths.length > 0 && map) {
    loadValidationData(selectedMonths);
  }
});

document.getElementById('validation-cluster-filter').addEventListener('change', function() {
  const selectedMonths = Array.from(
    document.getElementById('validation-month-select').selectedOptions
  ).map(o => o.value);
  
  const selectedClusters = Array.from(this.selectedOptions)
    .map(o => o.value);

  loadValidationData(selectedMonths, selectedClusters);
});


function calculateRegressionByCluster(originalData, transmitanceData) {
  const clusters = {};
  
// collecte de données pour chaque cluster
  for (const key in transmitanceData) {
    const transPoint = transmitanceData[key];
    const originalPointKey = Object.keys(originalData).find(
      k => originalData[k].ID === transPoint.ID
    );
    const originalPoint = originalData[originalPointKey];
    
    if (!originalPoint || !transPoint.cluster) continue;
    
    const cluster = transPoint.cluster;
    if (!clusters[cluster]) {
      clusters[cluster] = { x: [], y: [] };
    }
    
    //ajouter des données pour chaque mois
    for (const month in originalPoint.values) {
      if (originalPoint.values[month] && transPoint.values[month]) {
        clusters[cluster].x.push(originalPoint.values[month]);
        clusters[cluster].y.push(transPoint.values[month]);
      }
    }
  }
  
//calculer regression linéaire de chaque cluster
  const regressionResults = {};
  for (const cluster in clusters) {
    const { x, y } = clusters[cluster];
    if (x.length < 2) continue;
    
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
      sumY2 += y[i] * y[i];
    }
    
    const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - a * sumX) / n;
    
    // calculer R²
    const yMean = sumY / n;
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < n; i++) {
      ssTot += Math.pow(y[i] - yMean, 2);
      const yPred = a * x[i] + b;
      ssRes += Math.pow(y[i] - yPred, 2);
    }
    const r2 = 1 - (ssRes / ssTot);
    
    regressionResults[cluster] = { a, b, r2 };
  }
  
  return regressionResults;
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('validation-cluster-filter').addEventListener('change', function() {
    const selectedMonths = Array.from(
      document.getElementById('validation-month-select').selectedOptions
    ).map(o => o.value);
    
    const selectedClusters = Array.from(this.selectedOptions)
      .map(o => o.value);

    loadValidationData(selectedMonths, selectedClusters);
  });
  
  document.getElementById('back-button').addEventListener('click', goBack);
});
document.getElementById("year-selection").addEventListener("change", () => {
  loadMapBasedOnSelection();
});

