interface ChangelogEntry {
  version: string;
  changes: string;
}

export async function getLatestChangelog(): Promise<ChangelogEntry> {
  try {
    const response = await fetch('/docs/CHANGELOG.md');
    const text = await response.text();
    
    // Parse the changelog to get the latest version
    const versionMatch = text.match(/## \[(.*?)\]/);
    const version = versionMatch ? versionMatch[1] : '0.0.0';
    
    // Get the changes section
    const changesSection = text.split('## ')[1]?.split('\n\n')[0] || '';
    const changes = changesSection
      .split('\n')
      .filter(line => line.startsWith('- '))
      .map(line => line.replace('- ', ''))
      .join('\n');
    
    return { version, changes };
  } catch (error) {
    console.error('Failed to fetch changelog:', error);
    return { version: '0.0.0', changes: 'Update available' };
  }
}