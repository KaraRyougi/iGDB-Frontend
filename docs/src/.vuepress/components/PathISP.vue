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
  <input type="submit"/>
</form>
<div ref="map" class="map"></div>
</div>
</template>

<script>
import isp from '../data/isp'
import { Map, View } from 'ol'
import { Style, Stroke } from 'ol/style'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
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
  }),
  methods: {
    async onSubmit() {
      let geojsonObject = null

      const selectedISP = this.selected[0].corpName
      try {
        const response = await fetch(`/isp-paths/${selectedISP}.json`)
        geojsonObject = await response.json()
      } catch (ex) {
        console.error(ex)
      }

      const geoFeatures = new GeoJSON().readFeatures(geojsonObject, { featureProjection: 'EPSG:3857' })
      const vectorSource = new VectorSource({
        features: geoFeatures
      })
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: styleFunction,
      })
    },
  },
  mounted() {
    const vectorLayer = new VectorLayer({})
    new Map({
    target: this.$refs['map'],
    layers: [
        new TileLayer({
        source: new OSM()
        }),
        vectorLayer
    ],
    view: new View({
        zoom: 0,
        center: [0, 0],
        constrainResolution: true
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