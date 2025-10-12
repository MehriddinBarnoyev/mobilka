'use client';

import {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  ChevronLeft,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  Shield,
  Eye,
  Database,
  Users,
  Lock,
  Globe,
  Mail,
  AlertTriangle,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../type';

const {width, height} = Dimensions.get('window');

interface PolicySection {
  id: string;
  title: string;
  icon: any;
  content: string;
  subsections?: PolicySubsection[];
}

interface PolicySubsection {
  title: string;
  content: string;
}

// Lorem Ipsum generator function
const generateLoremIpsum = (sentences: number): string => {
  const loremSentences = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
    'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.',
    'Explicabo nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit ',
    'Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
    'Ut aliquam quaerat voluptatem ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.',
  ];

  let result = '';
  for (let i = 0; i < sentences; i++) {
    result += loremSentences[i % loremSentences.length] + ' ';
  }
  return result.trim();
};

export default function Offerta() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [highlightedText, setHighlightedText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<{[key: string]: number}>({});

  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const policyData: PolicySection[] = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      content: generateLoremIpsum(4),
      subsections: [
        {
          title: 'Personal Information',
          content: generateLoremIpsum(3),
        },
        {
          title: 'Usage Data',
          content: generateLoremIpsum(3),
        },
        {
          title: 'Device Information',
          content: generateLoremIpsum(2),
        },
      ],
    },
    {
      id: 'information-usage',
      title: 'How We Use Your Information',
      icon: Eye,
      content: generateLoremIpsum(4),
      subsections: [
        {
          title: 'Service Provision',
          content: generateLoremIpsum(3),
        },
        {
          title: 'Communication',
          content: generateLoremIpsum(2),
        },
        {
          title: 'Improvement and Analytics',
          content: generateLoremIpsum(3),
        },
      ],
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing and Disclosure',
      icon: Users,
      content: generateLoremIpsum(4),
      subsections: [
        {
          title: 'Third-Party Service Providers',
          content: generateLoremIpsum(3),
        },
        {
          title: 'Legal Requirements',
          content: generateLoremIpsum(2),
        },
        {
          title: 'Business Transfers',
          content: generateLoremIpsum(2),
        },
      ],
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Lock,
      content: generateLoremIpsum(4),
      subsections: [
        {
          title: 'Security Measures',
          content: generateLoremIpsum(3),
        },
        {
          title: 'Data Breach Response',
          content: generateLoremIpsum(2),
        },
      ],
    },
    {
      id: 'user-rights',
      title: 'Your Rights and Choices',
      icon: Shield,
      content: generateLoremIpsum(4),
      subsections: [
        {
          title: 'Access and Correction',
          content: generateLoremIpsum(3),
        },
        {
          title: 'Data Deletion',
          content: generateLoremIpsum(2),
        },
        {
          title: 'Opt-Out Options',
          content: generateLoremIpsum(3),
        },
      ],
    },
    {
      id: 'international-transfers',
      title: 'International Data Transfers',
      icon: Globe,
      content: generateLoremIpsum(3),
    },
    {
      id: 'contact-information',
      title: 'Contact Information',
      icon: Mail,
      content: generateLoremIpsum(3),
    },
    {
      id: 'policy-changes',
      title: 'Changes to This Policy',
      icon: AlertTriangle,
      content: generateLoremIpsum(3),
    },
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const scrollToSection = (sectionId: string) => {
    const yOffset = sectionRefs.current[sectionId];
    if (yOffset !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({y: yOffset, animated: true});
      setShowTableOfContents(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setHighlightedText(query.toLowerCase());
  };

  const highlightSearchText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts
      .map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? `**${part}**` : part,
      )
      .join('');
  };

  const filteredSections = policyData.filter(
    section =>
      searchQuery === '' ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const TableOfContents = () => (
    <View style={styles.tocContainer}>
      <View style={styles.tocHeader}>
        <Text style={styles.tocTitle}>Table of Contents</Text>
        <TouchableOpacity
          onPress={() => setShowTableOfContents(false)}
          style={styles.tocCloseButton}>
          <ChevronUp size={20} color="#666666" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.tocScrollView}>
        {policyData.map((section, index) => (
          <TouchableOpacity
            key={section.id}
            style={styles.tocItem}
            onPress={() => scrollToSection(section.id)}
            activeOpacity={0.7}>
            <View style={styles.tocItemLeft}>
              <Text style={styles.tocNumber}>{index + 1}</Text>
              <section.icon size={16} color="#666666" strokeWidth={1.5} />
            </View>
            <Text style={styles.tocItemTitle}>{section.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const PolicySectionComponent = ({
    section,
    index,
  }: {
    section: PolicySection;
    index: number;
  }) => {
    const isExpanded = expandedSections.has(section.id);

    return (
      <View
        style={styles.sectionContainer}
        onLayout={event => {
          sectionRefs.current[section.id] = event.nativeEvent.layout.y;
        }}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(section.id)}
          activeOpacity={0.7}>
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.sectionIconContainer}>
              <section.icon size={20} color="#1A1A1A" strokeWidth={1.5} />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionNumber}>{index + 1}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          </View>
          {isExpanded ? (
            <ChevronUp size={20} color="#666666" strokeWidth={1.5} />
          ) : (
            <ChevronDown size={20} color="#666666" strokeWidth={1.5} />
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionText}>
              {highlightSearchText(section.content, searchQuery)}
            </Text>

            {section.subsections && (
              <View style={styles.subsectionsContainer}>
                {section.subsections.map((subsection, subIndex) => (
                  <View key={subIndex} style={styles.subsection}>
                    <Text style={styles.subsectionTitle}>
                      {subsection.title}
                    </Text>
                    <Text style={styles.subsectionText}>
                      {highlightSearchText(subsection.content, searchQuery)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <ChevronLeft size={24} color="#1A1A1A" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <TouchableOpacity
          style={styles.tocButton}
          onPress={() => setShowTableOfContents(!showTableOfContents)}
          activeOpacity={0.7}>
          <ChevronDown size={20} color="#1A1A1A" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666666" strokeWidth={1.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search privacy policy..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Last Updated */}
      <View style={styles.lastUpdatedContainer}>
        <Calendar size={16} color="#666666" strokeWidth={1.5} />
        <Text style={styles.lastUpdatedText}>Last updated: {lastUpdated}</Text>
      </View>

      {/* Table of Contents Overlay */}
      {showTableOfContents && <TableOfContents />}

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Your Privacy Matters</Text>
          <Text style={styles.introText}>
            {generateLoremIpsum(3)} This privacy policy explains how we collect,
            use, and protect your personal information when you use our film
            platform services.
          </Text>
        </View>

        {/* Policy Sections */}
        {filteredSections.map((section, index) => (
          <PolicySectionComponent
            key={section.id}
            section={section}
            index={index}
          />
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            If you have any questions about this Privacy Policy, please contact
            us at privacy@filmplatform.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  tocButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
  },
  lastUpdatedText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  tocContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    zIndex: 1000,
    maxHeight: height * 0.6,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tocHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  tocCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tocScrollView: {
    maxHeight: height * 0.4,
  },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tocItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  tocNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginRight: 8,
    width: 20,
  },
  tocItemTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  introSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  introText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginVertical: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 16,
  },
  subsectionsContainer: {
    marginTop: 8,
  },
  subsection: {
    marginBottom: 16,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E5E5',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  subsectionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
