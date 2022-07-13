<!-- TODOO:
Input box format filter (pure number or AS[number])
 -->

<template>
<div>
<form @submit.prevent="onSubmit">
  <v-select label="ASN" taggable multiple :dropdown-should-open="_=>{return false}" :options=[]>

  </v-select>
  <input type="submit" value="Plot"/>
</form>
<div ref="map" class="map">
</div>
</div>
</template>