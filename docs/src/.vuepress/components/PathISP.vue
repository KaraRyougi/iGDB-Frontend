<template>
<div>
<form @submit.prevent="onSubmit">
  <v-select label="corpName" :options="isp" v-model="selected" multiple>
    <template #search="{ attributes, events }">
      <input
        :required="!selected"
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
import { Map, View } from 'ol'
import { Style, Stroke, Text } from 'ol/style'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { FullScreen, defaults as defaultControls } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON'
import smooth from 'chaikin-smooth'

const styles = {
    'LineString': [
    new Style({
        stroke: new Stroke({
        color: '#1565C0',
        width: 2,
        zIndex: 0,
        }),
    }),
    ]
}

const styleFunction = function (feature) {
    return styles[feature.getGeometry().getType()]
}

export default {
  data: () => ({
    isp,
    selected: null,
    map: null,
    vectorLayer: null
  }),
  methods: {
    async onSubmit() {
      const vectorSource = new VectorSource({})
      for (const element of this.selected) {
        let geojsonObject = null
        const selectedISP = element.corpName
        try {
          const response = await fetch(`/isp-paths/${selectedISP}.json`)
          geojsonObject = await response.json()
        } catch (ex) {
          console.error(ex)
        }
        const geoFeatures = new GeoJSON().readFeatures(geojsonObject, { featureProjection: 'EPSG:3857' })
        geoFeatures.forEach(feature => vectorSource.addFeature(feature))
      }
      this.vectorLayer.setSource(vectorSource)
    },
  },
  mounted() {
    this.vectorLayer = new VectorLayer({style: styleFunction})
    this.map = new Map({
      controls: defaultControls().extend([new FullScreen()]),
      target: this.$refs['map'],
      layers: [
        new TileLayer({
          source: new OSM()
          }),
        this.vectorLayer
      ],
      view: new View({
          zoom: 0,
          center: [0, 0],
          constrainResolution: false,
      }),
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