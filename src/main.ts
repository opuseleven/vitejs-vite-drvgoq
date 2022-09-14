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

type FlattenedFeature = Omit<Feature, 'geometry'> & { geometry: String[] };

/**
 * Take a standard GeoJSON structure in, return a Featurelike object whose geometry property is more flat (less deeply nested)
 */
function flattenFeature(input: Feature): FlattenedFeature {
  const featureType = input.geometry.type;

  let returnArr: String[] = [featureType];

  function flattenPoint(point: Number[]): String {
    let coordString = '';
    for (let i = 0; i < point.length; i++) {
      coordString = [coordString, point[i]].join(', ');
    }
    return coordString.substring(2);
  }

  if (input.geometry.type === 'Point') {
    returnArr.push(flattenPoint(input.geometry.coordinates));
  } else if (input.geometry.type === 'LineString') {
    for (let i = 0; i < input.geometry.coordinates.length; i++) {
      returnArr.push(flattenPoint(input.geometry.coordinates[i]));
    }
  } else if (input.geometry.type === 'Polygon') {
    for (let i = 0; i < input.geometry.coordinates.length; i++) {
      for (let j = 0; j < input.geometry.coordinates[i].length; j++) {
        returnArr.push(flattenPoint(input.geometry.coordinates[i][j]));
      }
      returnArr.push('||'); // esc char to designate start of new array
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
  const featureType = input.geometry[0];

  let coordinateArr: any[] = [];
  let polygonArr: any[] = [];

  function unFlattenPoint(point: String) {
    const stringArr = point.split(', ');
    let numArr = [];
    for (let i = 0; i < stringArr.length; i++) {
      numArr.push(parseFloat(stringArr[i]))
    }
    return numArr;
  }

  if (featureType === 'Point') {
    const pointArr = unFlattenPoint(input.geometry[1]);
    coordinateArr = [...pointArr];
  } else if (featureType === 'LineString') {
    for (let i = 1; i < input.geometry.length; i++) {
      const pointArr = unFlattenPoint(input.geometry[i]);
      coordinateArr.push(pointArr);
    }
  } else if (featureType === 'Polygon') {
    for (let i = 1; i < input.geometry.length; i++) {
      if (input.geometry[i] === '||') {
        polygonArr.push(coordinateArr);
        coordinateArr = [];
      } else {
        const pointArr = unFlattenPoint(input.geometry[i]);
        coordinateArr.push(pointArr);
      }
    }
  }

  const returnFeature = {
    type: input.type,
    geometry: {
      type: featureType,
      coordinates: featureType === 'Polygon' ? polygonArr : coordinateArr,
    },
    properties: input.properties
  }
  ''
  return returnFeature;
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
