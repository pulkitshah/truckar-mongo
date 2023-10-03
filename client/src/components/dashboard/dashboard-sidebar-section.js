import PropTypes from 'prop-types';
import { List } from '@mui/material';
import { DashboardSidebarItem } from './dashboard-sidebar-item';

const renderNavItems = ({ depth = 0, items, path, onClose }) => (
  <List disablePadding>
    {items.reduce(
      (acc, item) =>
        reduceChildRoutes({
          acc,
          item,
          depth,
          path,
          onClose,
        }),
      []
    )}
  </List>
);

const reduceChildRoutes = ({ acc, item, depth, path, onClose }) => {
  const key = `${item.title}-${depth}`;
  const partialMatch = path.includes(item.path);
  const exactMatch = path === item.path;

  if (item.children) {
    acc.push(
      <DashboardSidebarItem
        onClose={onClose}
        active={partialMatch}
        chip={item.chip}
        depth={depth}
        icon={item.icon}
        info={item.info}
        key={key}
        open={partialMatch}
        path={item.path}
        title={item.title}
      >
        {renderNavItems({
          depth: depth + 1,
          items: item.children,
          path,
          onClose,
        })}
      </DashboardSidebarItem>
    );
  } else {
    acc.push(
      <DashboardSidebarItem
        active={exactMatch}
        onClose={onClose}
        chip={item.chip}
        depth={depth}
        icon={item.icon}
        info={item.info}
        key={key}
        path={item.path}
        title={item.title}
      />
    );
  }

  return acc;
};

export const DashboardSidebarSection = (props) => {
  const { items, path, title, onClose, ...other } = props;

  return (
    <List {...other}>
      {renderNavItems({
        items,
        onClose,
        path,
      })}
    </List>
  );
};

DashboardSidebarSection.propTypes = {
  items: PropTypes.array.isRequired,
  path: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
