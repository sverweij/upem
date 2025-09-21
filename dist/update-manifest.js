function isUpAbleDependencyKey(pSkipDependencyTypes) {
	return (pManifestKey) =>
		pManifestKey.includes("ependencies") &&
		!pSkipDependencyTypes.includes(pManifestKey);
}
function getRangePrefix(pVersionRangeString) {
	return (
		/^(?<prefix>\D{0,2}).+/.exec(pVersionRangeString)?.groups?.prefix ?? ""
	);
}
export function determineSavePrefix(pVersionRangeString, pOptions) {
	const lIndividualRangePrefix = getRangePrefix(pVersionRangeString);
	if (pOptions?.saveExact && lIndividualRangePrefix) {
		return lIndividualRangePrefix;
	}
	return pOptions?.saveExact ? "" : (pOptions?.savePrefix ?? "^");
}
export function updateDependencyKey(
	pDependencyObject,
	pOutdatedList,
	pOptions,
) {
	return {
		...pDependencyObject,
		...Object.keys(pDependencyObject)
			.filter((pDependency) =>
				pOutdatedList.some(
					(pOutdatedEntry) => pOutdatedEntry.package === pDependency,
				),
			)
			.reduce((pAll, pPackageName) => {
				pAll[pPackageName] =
					`${determineSavePrefix(pDependencyObject[pPackageName], pOptions)}${pOutdatedList.find((pOutdatedEntry) => pOutdatedEntry.package === pPackageName)?.target}`;
				return pAll;
			}, {}),
	};
}
export function updateManifest(pManifestObject, pOutdatedPackages, pOptions) {
	return {
		...pManifestObject,
		...Object.keys(pManifestObject)
			.filter(isUpAbleDependencyKey(pOptions?.skipDependencyTypes ?? []))
			.reduce((pAll, pDependencyKey) => {
				pAll[pDependencyKey] = updateDependencyKey(
					pManifestObject[pDependencyKey],
					pOutdatedPackages,
					pOptions,
				);
				return pAll;
			}, {}),
	};
}
