// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import PatientCard from './PatientCard';
// import LocalPatientCard from './LocalPatientCard';
// import { type HIEBundleResponse, type LocalResponse } from '../type';


// interface SearchResultsProps {
//   hasSearched: boolean;
//   searchResults: Array<HIEBundleResponse>;
//   localSearchResults: Array<LocalResponse>;
// }

// const SearchResults : React.FC<SearchResultsProps> = ({
//   hasSearched,
//   searchResults,
//   localSearchResults,
//   syncedPatients,
//   styles,
//   getHiePatientCount,
//   convertLocalPatientToFHIR,
//   ErrorState,
//   showDependentsForPatient,
//   hasDependents,
//   eligibilityResponse,
//   isEligibilityLoading,
//   toggleDependentsVisibility,
//   PatientPhoto,
//   EnhancedPatientBannerPatientInfo,
//   DependentsComponent,
//   hasDifferences,
//   handleSyncSuccess,
//   handleOtpVerification,
//   PatientSyncButton,
// }) => {
//   const { t } = useTranslation();

//   if (!hasSearched) return null;

//   const hasHieResults =
//     searchResults &&
//     Array.isArray(searchResults) &&
//     searchResults.length > 0 &&
//     searchResults.some((bundle) => bundle.total > 0 && bundle.entry && bundle.entry.length > 0);

//   const hasLocalResults = localSearchResults && Array.isArray(localSearchResults) && localSearchResults.length > 0;

//   if (!hasHieResults && !hasLocalResults) {
//     return <ErrorState subTitle={t('checkFilters', 'Please check the filters above and try again')} />;
//   }

//   return (
//     <div className={styles.searchResultsContainer}>
//       {hasHieResults && (
//         <div className={styles.hieResultsSection}>
//           <div className={styles.resultsHeader}>
//             <span className={styles.identifierTypeHeader}>
//               {t('hieResults', 'Patient(s) found {{count}}', {
//                 count: getHiePatientCount(searchResults),
//               })}
//             </span>
//           </div>
//           <div>
//             {searchResults.map((bundle, index) => (
//               <PatientCard
//                 key={`bundle-${index}`}
//                 bundle={bundle}
//                 bundleIndex={index}
//                 localSearchResults={localSearchResults}
//                 convertLocalPatientToFHIR={convertLocalPatientToFHIR}
//                 syncedPatients={syncedPatients}
//                 showDependentsForPatient={showDependentsForPatient}
//                 hasDependents={hasDependents}
//                 hasDifferences={hasDifferences}
//                 eligibilityResponse={eligibilityResponse}
//                 isEligibilityLoading={isEligibilityLoading}
//                 handleSyncSuccess={handleSyncSuccess}
//                 handleOtpVerification={handleOtpVerification}
//                 toggleDependentsVisibility={toggleDependentsVisibility}
//                 styles={styles}
//                 PatientPhoto={PatientPhoto}
//                 EnhancedPatientBannerPatientInfo={EnhancedPatientBannerPatientInfo}
//                 PatientSyncButton={PatientSyncButton}
//                 DependentsComponent={DependentsComponent}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {hasLocalResults && !syncedPatients.has(convertLocalPatientToFHIR(localSearchResults[0]).id) && (
//         <div className={styles.localResultsSection}>
//           <div className={styles.resultsHeader}>
//             <span className={styles.identifierTypeHeader}>{t('revisitPatient', 'Revisit patient')}</span>
//           </div>
//           <div>
//             <LocalPatientCard
//               localSearchResults={localSearchResults}
//               convertLocalPatientToFHIR={convertLocalPatientToFHIR}
//               syncedPatients={syncedPatients}
//               showDependentsForPatient={showDependentsForPatient}
//               hasDependents={hasDependents}
//               eligibilityResponse={eligibilityResponse}
//               isEligibilityLoading={isEligibilityLoading}
//               toggleDependentsVisibility={toggleDependentsVisibility}
//               styles={styles}
//               PatientPhoto={PatientPhoto}
//               EnhancedPatientBannerPatientInfo={EnhancedPatientBannerPatientInfo}
//               DependentsComponent={DependentsComponent}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Usage example:
// /*
// <SearchResults
//   hasSearched={hasSearched}
//   searchResults={searchResults}
//   localSearchResults={localSearchResults}
//   syncedPatients={syncedPatients}
//   styles={styles}
//   getHiePatientCount={getHiePatientCount}
//   convertLocalPatientToFHIR={convertLocalPatientToFHIR}
//   ErrorState={ErrorState}
//   // Shared props
//   showDependentsForPatient={showDependentsForPatient}
//   hasDependents={hasDependents}
//   eligibilityResponse={eligibilityResponse}
//   isEligibilityLoading={isEligibilityLoading}
//   toggleDependentsVisibility={toggleDependentsVisibility}
//   PatientPhoto={PatientPhoto}
//   EnhancedPatientBannerPatientInfo={EnhancedPatientBannerPatientInfo}
//   DependentsComponent={DependentsComponent}
//   // PatientCard specific props
//   hasDifferences={hasDifferences}
//   handleSyncSuccess={handleSyncSuccess}
//   handleOtpVerification={handleOtpVerification}
//   PatientSyncButton={PatientSyncButton}
// />
// */

// export default SearchResults;
