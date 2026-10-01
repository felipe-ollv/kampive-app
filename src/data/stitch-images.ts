import { Asset } from 'expo-asset';

// Original images from the user-provided Google Stitch export.
export const stitchImages = {
  home: [
    Asset.fromModule(require('../../assets/stitch/home-0.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/home-1.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/home-2.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/home-3.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/home-4.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/home-5.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/home-6.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/home-7.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/home-8.jpg')).uri,
  ],
  profile: [
    Asset.fromModule(require('../../assets/stitch/profile-0.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/profile-1.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/profile-2.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/profile-3.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/profile-4.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/profile-5.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/profile-6.jpg')).uri,
  ],
  detail: [
    Asset.fromModule(require('../../assets/stitch/detail-0.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/detail-1.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/detail-2.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/detail-3.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/detail-4.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/detail-5.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/detail-6.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/detail-7.jpg')).uri,
  ],
  review: [
    Asset.fromModule(require('../../assets/stitch/review-0.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/review-1.jpg')).uri,
  ],
  create: [
    Asset.fromModule(require('../../assets/stitch/create-0.jpg')).uri,
    Asset.fromModule(require('../../assets/stitch/create-1.jpg')).uri,
  ],
  register: [Asset.fromModule(require('../../assets/stitch/register-0.jpg')).uri],
};
