<!-- TODOO:
Input box search for org name / as number
Pagination? Or simply limit the max number?
Multiple sources of org name what to do?
Get rid of duplication?
Toggle different sources
Plot PoPs
 -->

<template>
<div>
<form @submit.prevent="onSubmit">
  <v-select
  label="asn"
  v-model="selectedASN"
  multiple
  :filterable="false"
  :options="options" 
  @search="onSearch"
  @open="() => clearSearch=false"
  @close="() => {clearSearch=true; options=[]}"
  :closeOnSelect="false" 
  :clearSearchOnSelect="false"
  :clearSearchOnBlur="(clearSearch) => {return clearSearch}"
  >
    <template slot="no-options">
      type to begin search...
    </template>
    <template slot="option" slot-scope="option">
      <div>
        <div><b>{{ option.organization }}</b></div>
        <div>{{ option.asn }}</div>
      </div>
    </template>
    <template slot="selected-option" slot-scope="option">
      <div>AS{{ option.asn }}</div>
    </template>
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
import _ from 'lodash'

export default {
  name: 'MapContainer',
  components: {},
  props: {},
  
  data: () => ({
    map: null,
    vectorLayer: new VectorLayer(),
    overlay: null,
    plotText: 'Plot',
    clearSearch: false,
    options: [],
    selectedASN: null,
  }),

  methods: {
    async onSubmit() {
      this.clearSearch = true
      this.plotText = 'Plotting...'
      let index = 0
      const vectorSource = new VectorSource({})
      for (const element of this.selectedASN) {
        fetch(
          `http://localhost:8080/asn_geo?asn=${element.asn}`
        ).then(res =>
          res.json().then(json => (json.data))
        )
      //   let orgNames = null
      //   let pops = null
      //   const selection = element.asn
      //   try {
      //     var response = await fetch()
      //     orgNames = await response.json()
      //     response = await fetch(`http://localhost:8080/asn_geo?asn=${escape(selection)}`)
      //     pops = await response.json()
      //   } catch (ex) {
      //     console.error(ex)
      //   }
      //   console.log(pops)
      }
      // this.vectorLayer.setSource(vectorSource)
      this.plotText = 'Plot'
      this.clearSearch = false
    },
    onSearch(query, loading) {
      if(Number.isInteger(parseInt(query))) {
        loading(true)
        this.debouncedSearchASN(query, loading, this)
      } else if(query.length > 2) {
        loading(true)
        this.debouncedSearchOrg(query, loading, this)
      }
    },

    debouncedSearchOrg: _.debounce((query, loading, vm) => {
      fetch(
        `http://localhost:8080/asn_search?org=${query}`
      ).then(res =>
        res.json().then(json => (vm.options = json.data.slice(0, 100)))
      )
      loading(false)
    }, 350),

    debouncedSearchASN: _.debounce((query, loading, vm) => {
      fetch(
        `http://localhost:8080/asn_org?asn=${query}`
      ).then(res =>
        res.json().then(json => (vm.options = json.data.slice(0, 100)))
      )
      loading(false)
    }, 350),
  },

  mounted() {
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