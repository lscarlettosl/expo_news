import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { Card } from 'react-native-paper';

const HomeScreen = ({ navigation }) => {
  const [leftArticles, setLeftArticles] = useState([]);
  const [rightArticles, setRightArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const [response1, response2] = await Promise.all([
          axios.get('http://lenta.ru/rss/last24', {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
            },
          }),
          axios.get('http://lenta.ru/rss/top7', {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
            },
          })
        ]);

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '',
        });

        const parsedData1 = parser.parse(response1.data);
        const items1 = parsedData1.rss.channel.item;
        setLeftArticles(Array.isArray(items1) ? items1 : [items1]);

        const parsedData2 = parser.parse(response2.data);
        const items2 = parsedData2.rss.channel.item;
        setRightArticles(Array.isArray(items2) ? items2 : [items2]);

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load news: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.column}>
        <FlatList
          data={leftArticles}
          keyExtractor={(item) => item.guid || item.link}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('Details', { article: item })}>
              <Card style={styles.article}>
                {item.enclosure && item.enclosure.url ? (
                  <Card.Cover source={{ uri: item.enclosure.url }} />
                ) : null}
                <Card.Content>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.column}>
        <FlatList
          data={rightArticles}
          keyExtractor={(item) => item.guid || item.link}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('Details', { article: item })}>
              <Card style={styles.article}>
                {item.enclosure && item.enclosure.url ? (
                  <Card.Cover source={{ uri: item.enclosure.url }} />
                ) : null}
                <Card.Content>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  column: {
    flex: 1,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  article: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
