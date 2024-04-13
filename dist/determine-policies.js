function determineTargetVersion(pOutdatedEntry, pPolicy) {
	return pOutdatedEntry[pPolicy] || pOutdatedEntry.current;
}
function objectToArray(pObject) {
	return Object.keys(pObject).map((pKey) => ({
		package: pKey,
		...pObject[pKey],
	}));
}
function tagOutdatedEntry(pPolicies) {
	return (pOutdatedEntry) => {
		const lPolicy =
			pPolicies.find((pPolicy) => pPolicy.package === pOutdatedEntry.package)
				?.policy ?? "latest";
		return {
			...pOutdatedEntry,
			policy: lPolicy,
			target: determineTargetVersion(pOutdatedEntry, lPolicy),
		};
	};
}
export function isUpAble(pOutdated) {
	return pOutdated.current !== pOutdated.target;
}
export function determinePolicies(pOutdatedPackages, pPolicies) {
	return objectToArray(pOutdatedPackages).map(tagOutdatedEntry(pPolicies));
}
