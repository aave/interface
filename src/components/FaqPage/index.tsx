import { Add, Remove } from '@mui/icons-material';
import { Collapse, Typography } from '@mui/material';
import { useState } from 'react';
import Layout from 'src/components/Layout';
import MaxWidthContainer from 'src/components/MaxWidthContainer';

import { FAQ_CATEGORIES } from './const';
import {
  Answer,
  Content,
  Divider,
  IconBox,
  PageWrapper,
  Row,
  RowHead,
  Rows,
  Section,
  Sections,
} from './styles';

export default function FaqPage() {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    'general-0': true,
    'supplying-3': true,
  });

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Layout>
      <MaxWidthContainer>
        <PageWrapper>
          <Typography variant="h1" fontWeight={500} fontSize={60} lineHeight={1.2}>
            FAQ
          </Typography>

          <Content>
            <Divider />
            <Sections>
              {FAQ_CATEGORIES.map((category) => (
                <Section key={category.key}>
                  <Typography variant="h5">{category.title}</Typography>
                  <Rows>
                    {category.items.map((item, index) => {
                      const rowKey = `${category.key}-${index}`;
                      const isExpanded = Boolean(expandedRows[rowKey]);

                      return (
                        <Row key={rowKey} expanded={isExpanded}>
                          <RowHead>
                            <Typography variant="h6">{item.question}</Typography>
                            <IconBox onClick={() => toggleRow(rowKey)}>
                              {isExpanded ? <Remove fontSize="small" /> : <Add fontSize="small" />}
                            </IconBox>
                          </RowHead>
                          <Collapse in={isExpanded}>
                            <Answer>
                              <Typography variant="body1" color="text.secondary">
                                {item.answer}
                              </Typography>
                            </Answer>
                          </Collapse>
                        </Row>
                      );
                    })}
                  </Rows>
                </Section>
              ))}
            </Sections>
          </Content>
        </PageWrapper>
      </MaxWidthContainer>
    </Layout>
  );
}
