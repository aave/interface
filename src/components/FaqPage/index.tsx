import { Add, Remove } from '@mui/icons-material';
import { Collapse, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import Layout from 'src/components/Layout';
import MaxWidthContainer from 'src/components/MaxWidthContainer';

import { FAQ_CATEGORIES, faqSectionDomId } from './const';
import {
  Answer,
  Body,
  Content,
  Divider,
  IconBox,
  NavAside,
  NavLink,
  NavList,
  PageWrapper,
  Row,
  RowHead,
  Rows,
  Section,
  Sections,
} from './styles';

export default function FaqPage() {
  const [activeCategoryKey, setActiveCategoryKey] = useState(FAQ_CATEGORIES[0].key);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    'general-0': true,
    'supplying-3': true,
  });

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollToSection = useCallback((categoryKey: string) => {
    const id = faqSectionDomId(categoryKey);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
    setActiveCategoryKey(categoryKey);
  }, []);

  useEffect(() => {
    const hashId = window.location.hash.slice(1);
    if (hashId && document.getElementById(hashId)) {
      document.getElementById(hashId)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      const key = hashId.replace(/^faq-section-/, '');
      if (FAQ_CATEGORIES.some((c) => c.key === key)) {
        setActiveCategoryKey(key);
      }
    }
  }, []);

  useEffect(() => {
    const sections = FAQ_CATEGORIES.map((c) => ({
      key: c.key,
      el: document.getElementById(faqSectionDomId(c.key)),
    })).filter((s): s is { key: string; el: HTMLElement } => Boolean(s.el));

    const updateActive = () => {
      const triggerY = window.innerHeight * 0.32;
      let current = sections[0]?.key ?? FAQ_CATEGORIES[0].key;
      for (const { key, el } of sections) {
        if (el.getBoundingClientRect().top <= triggerY) {
          current = key;
        }
      }
      setActiveCategoryKey(current);
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, []);

  return (
    <Layout>
      <MaxWidthContainer>
        <PageWrapper>
          <Typography variant="h1" fontWeight={500} fontSize={60} lineHeight={1.2}>
            FAQ
          </Typography>

          <Body>
            <Content>
              <Divider />
              <Sections>
                {FAQ_CATEGORIES.map((category) => (
                  <Section key={category.key} id={faqSectionDomId(category.key)}>
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
                                {isExpanded ? (
                                  <Remove fontSize="small" />
                                ) : (
                                  <Add fontSize="small" />
                                )}
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
            <NavAside>
              <NavList aria-label="FAQ sections">
                {FAQ_CATEGORIES.map((category) => {
                  const id = faqSectionDomId(category.key);
                  return (
                    <NavLink
                      key={category.key}
                      href={`#${id}`}
                      active={activeCategoryKey === category.key}
                      aria-current={activeCategoryKey === category.key ? 'location' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(category.key);
                      }}
                    >
                      {category.title}
                    </NavLink>
                  );
                })}
              </NavList>
            </NavAside>
          </Body>
        </PageWrapper>
      </MaxWidthContainer>
    </Layout>
  );
}
