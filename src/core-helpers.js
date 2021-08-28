function getRangePrefix(pVersionRangeString) {
  return (
    // eslint-disable-next-line security/detect-unsafe-regex
    pVersionRangeString.match(/^(?<prefix>[^0-9]{0,2}).+/).groups.prefix || ""
  );
}

export function getPolicyOverrides(pPackageObject, pPolicyToFilter) {
  return (pPackageObject?.upem?.policies ?? [])
    .filter(
      (pPolicy) =>
        pPolicy.policy === pPolicyToFilter && Boolean(pPolicy.package)
    )
    .map((pPolicy) => pPolicy.package);
}

export function determineSavePrefix(pVersionRangeString, pOptions) {
  const lIndividualRangePrefix = getRangePrefix(pVersionRangeString);

  if (pOptions.saveExact && lIndividualRangePrefix) {
    return lIndividualRangePrefix;
  }

  return pOptions.saveExact ? "" : pOptions.savePrefix || "^";
}
