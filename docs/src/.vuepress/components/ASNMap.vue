<!-- TODOO:
Input box format filter (pure number or AS[number])
Plot PoP for the input
 -->

<template>
<div>
<form @submit.prevent="onSubmit">
  <v-select label="asn" taggable multiple v-model="selectedASN" :dropdown-should-open="_=>{return false}" :options=[]>
  </v-select>
  <input type="submit" :value="plotText"/>
</form>
<div ref="map" class="map">
  <div id="asn_marks"></div>
</div>
</div>
</template>

<script>
import { Map, View, Collection } from 'ol'
import { Style, Stroke, Text } from 'ol/style'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer, Group as LayerGroup } from 'ol/layer'
import { Control, FullScreen, defaults as defaultControls, ScaleLine } from 'ol/control'
import Overlay from 'ol/Overlay'

export default {
  name: 'MapContainer',
  components: {},
  props: {},
  
  data: () => ({
    map: null,
    vectorLayer: null,
    overlay: null,
    plotText: 'Plot',
    selectedASN: null
  }),

  methods: {
    async onSubmit() {
      this.plotText = 'Plotting...'
      let index = 0
      const vectorSource = new VectorSource({})
      for (const element of this.selectedASN) {
        let orgNames = null
        let PoPs = null
        const selection = element.asn
        try {
          var response = await fetch(`http://localhost:3000/asn_org?asn=${selection}`)
          orgNames = await response.json()
          response = await fetch(`http://localhost:3000/asn_geo?asn=${selection}`)
          PoPs = await response.json()
        } catch (ex) {
          console.error(ex)
        }
      }
      // this.vectorLayer.setSource(vectorSource)
      this.plotText = 'Plot'
    },
  },

  mounted() {
    this.highlightedOrg = null
    this.vectorLayer = new VectorLayer()
    this.overlay = new Overlay({
      element: asn_marks,
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
  }
}
</script>