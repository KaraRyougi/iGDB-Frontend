<template>
<div>
<form @submit.prevent="onSubmit">
  <v-select label="ASN" :v-model="selectedASN" multiple>
    <template #search="{ attributes, events }">
      <input
        :required="!selectedASN"
        class="vs__search"
        v-bind="attributes"
        v-on="events"
      />
    </template>
  </v-select>
  <input type="submit" value="Plot"/>
</form>

<div ref="map" class="map">
  <div id="tooltip"></div>
</div>
</div>
</template>