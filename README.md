# Lifemap query
## Description
This version of Lifemap will allow users to integrate an annotated map to their website easily. 

The url can integrate parameters that will specify what to see on the map and in what way. 

## Options available
Default options are displayed in square brackets []
* `tid=x,y,z` NCBI taxonomy id (taxid) of taxa to highlight. If more than one, should be separated by commas.
* `lang=[en]fr` Language of the base map
* `markers=[true]false` Should markers be displayed at the taxids locations? 
* `zoom=[true]false` Should the view be set to fit all taxid locations ? 
* ...

## Example
add what follows at the end of your url terminating with `index.html`
```
?lang=fr&tid=9443,2&zoom=true&markers=true
```

