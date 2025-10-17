type ValidatorLocation = {
  wallet: string;
  tier: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
};

const validatorMap: ValidatorLocation[] = [];

export function addValidatorLocation(entry: ValidatorLocation) {
  validatorMap.push(entry);
}

export function getValidatorMap() {
  return validatorMap;
}
