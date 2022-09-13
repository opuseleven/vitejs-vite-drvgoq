import {
  Feature,
  Point,
  LineString,
  Polygon,
  FeatureCollection,
} from 'geojson';
import deepEqual from 'deep-equal';

const outputDiv = document.querySelector<HTMLDivElement>('#output');

const sampleFeatures: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [102.0, 0.5] },
      properties: { prop0: 'value0' },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [102.0, 0.0],
          [103.0, 1.0],
          [104.0, 0.0],
          [105.0, 1.0],
        ],
      },
      properties: {
        prop0: 'value0',
        prop1: 0.0,
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [100.0, 0.0],
            [101.0, 0.0],
            [101.0, 1.0],
            [100.0, 1.0],
            [100.0, 0.0],
          ],
        ],
      },
      properties: {
        prop0: 'value0',
        prop1: { this: 'that' },
      },
    },
  ],
};

type FlattenedFeature = Omit<Feature, 'geometry'> & { geometry: any };

/**
 * Take a standard GeoJSON structure in, return a Featurelike object whose geometry property is more flat (less deeply nested)
 */
function flattenFeature(input: Feature): FlattenedFeature {
  const featureType = input.geometry.type;

  let returnArr = [featureType];

  if (input.geometry.type === 'Point') {
    for (let i = 0; i < input.geometry.coordinates.length; i++) {
      returnArr.push(input.geometry.coordinates[i].toString();
    }
  } else if (input.geometry.type === 'LineString') {
    for (let i = 0; i < input.geometry.coordinates.length; i++) {
      for (let j = 0; j < input.geometry.coordinates[i].length; j++) {
        returnArr.push(input.geometry.coordinates[i][j].toString());
      }
    }
  } else if (input.geometry.type === 'Polygon') {
    for (let i = 0; i < input.geometry.coordinates.length; i++) {
      for (let j = 0; j < input.geometry.coordinates[i].length; j++) {
        for (let k = 0; k < input.geometry.coordinates[i][j].length; k++) {
          returnArr.push(input.geometry.coordinates[i][j][k].toString());
        }
      }
    }
  }

  const returnFeature = {
    type: input.type,
    geometry: returnArr,
    properties: input.properties
  }

  return returnFeature;
}

/**
 * Inverse operation of 'flattenFeature'
 */
function unFlattenFeature(input: FlattenedFeature): Feature {
  return input;
}

function main() {
  for (const feature of sampleFeatures.features) {
    const flatFeature = flattenFeature(feature);
    const unFlatFeature = unFlattenFeature(flatFeature);

    if (deepEqual(feature, unFlatFeature, { strict: true })) {
      outputDiv!.innerHTML += 'Features are equal<br/>\n';
    }
  }
}

main();
