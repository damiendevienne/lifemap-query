/*
	All the functions for computing and displaying stuff on the basemap
*/


/*
	this DisplayTaxids() function is the main one. It will display the taxids required,
	and add markers (if marks=true), draw the tree (if tree=true), zoom to the taxids (if zoom=true), etc. 
*/

var DisplayTaxids = function(taxids, zoom, marks=false, tree=false) {
	taxids = taxids.filter( onlyUnique );
	taxid = "(" + taxids.map(el => el.trim()).join(" ") + ")";

	markers = new L.FeatureGroup();
	var url = 'http://'+ServerAddress+'/solr/taxo/select?q=taxid:'+taxid+'&wt=json';
	$.ajax({
		url : url,
		success : function(data) {
			var docs = JSON.stringify(data.response.docs);
			var ok = JSON.parse(docs);

			$.each(ok, function( index, value ) {
				var latlong = new L.LatLng(ok[index].lat[0], ok[index].lon[0]);
				var marker = L.marker(latlong,{icon: pin1, opacity:1});
				markers.addLayer(marker);
			});
			//take options into account
			if (zoom) {
				if (ok.length==1) {
					console.log(ok)
					map.setView(ok[0].coordinates, ok[0].zoom)
				}
				else {
					map.fitBounds(markers.getBounds());
				}
			}
			if (marks) {
				map.addLayer(markers)
			}
			if (tree) {
				//TODO

				allRoutes(taxid).then(function(resu) {
						var RESUFINAL = [];
						var RESUROUTES = [];
						for (i=0;i<resu.length; i++) {
							RESUFINAL[i] = resu[i].taxid[0]
							RESUROUTES[i] = resu[i].taxid.concat(resu[i].ascend)
						}
						getmultiRoute(RESUROUTES);
				})
			}
		},
		dataType : 'jsonp',
		jsonp : 'json.wrf'
	});	    
};


/*
Functions used by DisplayTaxids
*/
function onlyUnique(value, index, self) { 
	// Remove duplicate
	return self.indexOf(value) === index;
}


function allRoutes(multiTaxid) {
	return new Promise(function (resolve, reject) {
		var url = "http://"+ServerAddress+"/solr/addi/select?q=*:*&fq=taxid:("+multiTaxid+")&wt=json&rows=1000";
		$.ajax({
			url : url,
			success : function(data) {
				resolve(data.response.docs)
			},
			dataType : 'jsonp',
			jsonp : 'json.wrf'
		})
	});
}


function getmultiRoute(multiA) {
	var alreadymet=[];
	var NEW=[];
	for (i=0;i<multiA.length;i++) {
		NEW[i] = [];
		for (j=0;j<multiA[i].length;j++) {
			NEW[i].push(multiA[i][j])
			if (alreadymet.indexOf(multiA[i][j])!=-1) {
				break;
			}
			else {
				alreadymet.push(multiA[i][j]);
			}
		}
	}
	//this lists all required taxid, each once only. From those we will get lat/lon coordinates
	var URL_PREFIX_FINAL = "http://lifemap-ncbi.univ-lyon1.fr:8983/solr/taxo/select?q=taxid:(";
	var URL_SUFFIX = ")&wt=json&rows=10000";
	var URL = URL_PREFIX_FINAL + alreadymet.join(' ') + URL_SUFFIX;
	$.ajax({
		url : URL,
		success : function(data) {
			//create a dictionary
			var DictoLL = {};
			var DictoNAMES = {};
			// map.removeLayer(multipolyline);
			var docs = JSON.stringify(data.response.docs);
			var jsonData = JSON.parse(docs);
			for (i=0;i<jsonData.length;i++) {
				DictoLL[jsonData[i].taxid[0]] = jsonData[i].coordinates;
				DictoNAMES[jsonData[i].taxid[0]] = jsonData[i].sci_name;
			}
			//NOW we can convert NEW (taxids) into NEWLL (lat long for each taxid)
			var NEWLL = []
			for (i=0;i<NEW.length;i++) {
				NEWLL[i]=[]
				for (j=0;j<NEW[i].length; j++) {
					if (NEW[i][j]===0) {NEWLL[i][j] = [-4.226497,0];} //root coordinates
					else { NEWLL[i][j]=DictoLL[NEW[i][j]]; }
				}
			}
			multipolyline = L.polyline(NEWLL, {color: 'orange', opacity:0.6, weight:6, clickable:false}).addTo(map);
		},
		dataType : 'jsonp',
		jsonp : 'json.wrf'
	});
}  