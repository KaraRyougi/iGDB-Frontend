<!-- TODO:
Click & Pin
Toggle PoP display (?) 
CIS NEPHAX?
-->

<template>
<div>
<form @submit.prevent="onSubmit">
  <v-select
  label="corpName" 
  :options="isp"
  v-model="selectedIsp"
  multiple
  :closeOnSelect="false"
  :clearSearchOnSelect="false"
  :clearSearchOnBlur="(clearSearch) => {return clearSearch}">
    <template #search="{ attributes, events }">
      <input
        :required="!selectedIsp"
        class="vs__search"
        v-bind="attributes"
        v-on="events"
      />
    </template>
  </v-select>
  <input type="submit" :value="plotText"/>
</form>

<div ref="map" class="map">
  <div id="tooltip"></div>
</div>
</div>
</template>

<script>
import isp from '../data/isp'
import { Map, View, Collection } from 'ol'
import { Style, Stroke, Text } from 'ol/style'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer, Group as LayerGroup } from 'ol/layer'
import { Control, FullScreen, defaults as defaultControls, ScaleLine } from 'ol/control'
import Overlay from 'ol/Overlay'
import GeoJSON from 'ol/format/GeoJSON'
import smooth from 'chaikin-smooth'

const colorPalette = [
"#f44336",
"#03a9f4",
"#4caf50",
"#e91e63",
"#3f51b5",
"#9c27b0",
"#009688",
"#ffc107",
"#673ab7",
"#ff4081",
"#2196f3",
"#8bc34a",
"#607d8b",
"#ff5722",
"#cddc39",
"#00bcd4",
"#ffeb3b",
"#ff1744",
"#795548",
"#ff9800",
"#9e9e9e",
"#d500f9"
]

const setAlpha = function(color, opacity) {
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255)
    return color.substring(0,7) + _opacity.toString(16).toUpperCase()
}

const getRandomStyle = function (index) {
  return new Style({stroke: new Stroke({
    color: setAlpha(colorPalette[index], 0.55),
    width: 1.5,
  })})
}

export default {
  name: 'MapContainer',
  components: {},
  props: {},
  
  data: () => ({
    isp,
    selectedIsp: null,
    map: null,
    vectorLayer: null,
    highlightedOrg: null,
    overlay: null,
    plotText: 'Plot',
    clearSearch: false,
  }),

  methods: {
    async onSubmit() {
      this.clearSearch = true
      this.plotText = 'Plotting...'
      let index = 0
      const vectorSource = new VectorSource({})
      for (const element of this.selectedIsp) {
        let geojsonObject = null
        const selection = element.corpName
        try {
          const response = await fetch(`/isp-paths/${selection}.json`)
          geojsonObject = await response.json()
        } catch (ex) {
          console.error(ex)
        }
        const geoFeatures = new GeoJSON().readFeatures(geojsonObject, { featureProjection: 'EPSG:3857' })
        geoFeatures.forEach(feature => {
          feature.setStyle(getRandomStyle(index))
          vectorSource.addFeature(feature)
        })
        index++
      }
      this.vectorLayer.setSource(vectorSource)
      this.plotText = 'Plot'
      this.clearSearch = false
    },
  },

  mounted() {
    var standardWidth = 1.5
    var highlightedWidth = 3
    var clicked = false
    this.clearSearch = false
    this.highlightedOrg = null
    this.vectorLayer = new VectorLayer()
    this.overlay = new Overlay({
      element: tooltip,
      offset: [10, 0],
      positioning: 'bottom-left'
    })

    this.map = new Map({
      controls: defaultControls().extend([
        new FullScreen(),
        new ScaleLine(),
      ]),
      target: this.$refs['map'],
      layers: [
        new TileLayer({
          className: 'bw',
          source: new OSM()
          }),
        this.vectorLayer,
      ],
      overlays: [
        this.overlay,
      ],
      view: new View({
          zoom: 0,
          center: [0, 0],
          constrainResolution: false,
      }),
    })

    this.map.on('pointermove', (event) => {

      const hovered = this.map.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature,
        { hitTolerance: 5 },
      )

      const tooltip = document.getElementById('tooltip')

      if (hovered) {
        const oldOrg = this.highlightedOrg
        const newOrg = hovered.get('ORG')

        if (oldOrg != null) {
          if (oldOrg != newOrg) {
            // recover old path style & draw new highlighted path
            for (const path of this.vectorLayer.getSource().getFeatures()) {
              if (path.get('ORG') == oldOrg) {
                const oldColor = path.getStyle().getStroke().getColor()
                const newColor = setAlpha(oldColor, 0.55)
                const newStyle = new Style({
                  stroke: new Stroke({
                    color: newColor,
                    width: standardWidth,
                  }),
                  zIndex: 0,
                })
                path.setStyle(newStyle)
              } else if (path.get('ORG') == newOrg) {
                const oldColor = path.getStyle().getStroke().getColor()
                const newColor = setAlpha(oldColor, 0.85)
                const newStyle = new Style({
                  stroke: new Stroke({
                    color: newColor,
                    width: highlightedWidth,
                  }),
                  zIndex: 1000,
                })
                path.setStyle(newStyle)
              }
            }
          }
        } else {
          // previous = null, current = some path, draw new highlighted path
          for (const path of this.vectorLayer.getSource().getFeatures()) {
            if (path.get('ORG') == newOrg) {
              const oldColor = path.getStyle().getStroke().getColor()
              const newColor = setAlpha(oldColor, 0.85)
              const newStyle = new Style({
                stroke: new Stroke({
                  color: newColor,
                  width: highlightedWidth,
                }),
                zIndex: 1000,
              })
              path.setStyle(newStyle)
            }
          }
          tooltip.style.display = 'inline-block'
        }
        this.highlightedOrg = newOrg
        tooltip.innerHTML = newOrg
        this.overlay.setPosition(event.coordinate)
      } else {
        if (this.highlightedOrg != null) {
          // current = null, previous = some path, recover old path style
          for (const path of this.vectorLayer.getSource().getFeatures()) {
            if (path.get('ORG') == this.highlightedOrg) {
              const oldColor = path.getStyle().getStroke().getColor()
              const newColor = setAlpha(oldColor, 0.55)
              const newStyle = new Style({
                stroke: new Stroke({
                  color: newColor,
                  width: standardWidth,
                }),
                zIndex: 0,
              })
              path.setStyle(newStyle)
            }
          }
        }
        this.highlightedOrg = null
        tooltip.innerHTML = ''
        tooltip.style.display = 'none'
      }
    })
  }
}
</script>