<!-- TODO:
Show color legend label (bad readability, cancelled)
Select / highlight path and show label
'Plotting...' text while fetching JSON
Customizing color
Show path segments
Toggle PoP display -->

<template>
<div>
<form @submit.prevent="onSubmit">
  <v-select label="corpName" :options="isp" v-model="selectedIsp" multiple>
    <template #search="{ attributes, events }">
      <input
        :required="!selectedIsp"
        class="vs__search"
        v-bind="attributes"
        v-on="events"
      />
    </template>
  </v-select>
  <input type="submit" value="Plot"/>
</form>
<div ref="map" class="map"></div>
</div>
</template>

<script>
import isp from '../data/isp'
import { Map, View, Collection } from 'ol'
import { Style, Stroke, Text } from 'ol/style'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer, Group as LayerGroup } from 'ol/layer'
import { Control, FullScreen, defaults as defaultControls, ScaleLine } from 'ol/control'
import GeoJSON from 'ol/format/GeoJSON'
import smooth from 'chaikin-smooth'

const colorPalette = ["#f44336","#2196f3","#00bcd4","#ff9800","#e91e63","#8bc34a"]

const addAlpha = function(color, opacity) {
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255)
    return color + _opacity.toString(16).toUpperCase()
}

const getRandomStyle = function (index) {
  return new Style({stroke: new Stroke({
    color: addAlpha(colorPalette[index], 0.55),
    width: 2,
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
    // selectedPath: null,
  }),

  methods: {
    async onSubmit() {
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
    },
  },

  mounted() {
    // this.selectedPath = null
    this.vectorLayer = new VectorLayer()

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
      view: new View({
          zoom: 0,
          center: [0, 0],
          constrainResolution: false,
      }),
    })

    this.map.on('pointermove', (event) => {
      // if (this.selectedPath != null) {
      //   this.selectedPath == null
      // }
      this.map.forEachFeatureAtPixel(
        event.pixel,
        (feature) => {
          console.log(feature.get('ORG'))
        }
      )
    })
  }
}
</script>

<style scoped>
form {
  display: flex;
  align-items: stretch;
}

.v-select {
  width: 75%;
}

input[type='submit'] {
  margin-left: auto;
  background: #44ae7d;
  border: none;
  border-radius: 3px;
  color: #fff;
  width: 20%;
}

.map {
  height: 500px;
  padding-top: 1.5rem;
  width: 100%;
}

</style>

<style>
.bw {
  filter: grayscale(75%);
  /* filter: opacity(50%); */
}

</style>